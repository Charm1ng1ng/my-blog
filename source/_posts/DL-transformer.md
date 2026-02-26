---
title: Transformer深度学习模型详解
date: 2025-06-22 08:00:00
type: documents
categories: 深度学习
tags: [Transformer, NLP, Attention]
---
Transformer模型由Vaswani等人于2017年提出，完全基于注意力机制，摒弃了传统的RNN和CNN结构。

<!--more-->

## 背景

Transformer最早出现在论文《Attention Is All You Need》中，最初用于机器翻译任务。如今已成为NLP领域的基础架构，并扩展到计算机视觉等领域。

### RNN vs Transformer

| 特性 | RNN | Transformer |
|------|-----|-------------|
| 并行计算 | 串行 | 并行 |
| 长距离依赖 | 梯度消失 | 直接建模 |
| 计算复杂度 | O(n) | O(n²d) |

## 核心架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Transformer Encoder                     │
├─────────────────────────────────────────────────────────────┤
│  Input Embedding ──> Positional Encoding ──┐              │
│                                                ▼              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Multi-Head Self-Attention                 │ │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │ │
│  │  │Head 1  │  │Head 2  │  │Head n  │                 │ │
│  │  └────┬────┘  └────┬────┘  └────┬────┘                 │ │
│  │       └────────────┼────────────┘                      │ │
│  │                    ▼                                    │ │
│  │            Linear + Dropout                             │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Feed Forward Network                       │ │
│  │         Linear → ReLU → Linear                          │ │
│  └────────────────────┬────────────────────────────────────┘ │
│                       │                                      │
│                       ▼                                      │
│               Add & LayerNorm                                │
└─────────────────────────────────────────────────────────────┘
```

## 核心机制

### 1. 多头注意力机制

```python
import torch
import torch.nn as nn
import torch.nn.functional as F
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0
        
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        # Q, K, V 线性投影
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        
        # 输出投影
        self.W_o = nn.Linear(d_model, d_model)
        
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        
        # 线性投影并分头
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        # 缩放点积注意力
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        
        attn_weights = F.softmax(scores, dim=-1)
        attn_output = torch.matmul(attn_weights, V)
        
        # 合并多头
        attn_output = attn_output.transpose(1, 2).contiguous().view(batch_size, -1, self.num_heads * self.d_k)
        
        return self.W_o(attn_output)
```

### 2. 位置编码

位置编码为序列中的每个位置添加独特的位置信息：

```python
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        
        # 创建位置编码矩阵
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        
        # 计算除数项
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        
        # 偶数和奇数位置使用不同的三角函数
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        
        # 添加批次维度并注册为buffer
        pe = pe.unsqueeze(0)
        self.register_buffer('pe', pe)
        
    def forward(self, x):
        # 将位置编码加到输入上
        return x + self.pe[:, :x.size(1)]
```

### 3. 前馈网络

```python
class FeedForward(nn.Module):
    def __init__(self, d_model, d_ff, dropout=0.1):
        super().__init__()
        self.linear1 = nn.Linear(d_model, d_ff)
        self.linear2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x):
        return self.linear2(self.dropout(F.relu(self.linear1(x))))
```

### 4. 完整的Transformer编码器

```python
class TransformerEncoderLayer(nn.Module):
    def __init__(self, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.self_attn = MultiHeadAttention(d_model, num_heads)
        self.feed_forward = FeedForward(d_model, d_ff, dropout)
        self.norm1 = nn.LayerNorm(d_model)
        self.norm2 = nn.LayerNorm(d_model)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x, mask=None):
        # 自注意力 + 残差连接
        attn_output = self.self_attn(x, x, x, mask)
        x = self.norm1(x + self.dropout(attn_output))
        
        # 前馈网络 + 残差连接
        ff_output = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_output))
        
        return x

class TransformerEncoder(nn.Module):
    def __init__(self, num_layers, d_model, num_heads, d_ff, dropout=0.1):
        super().__init__()
        self.layers = nn.ModuleList([
            TransformerEncoderLayer(d_model, num_heads, d_ff, dropout)
            for _ in range(num_layers)
        ])
        
    def forward(self, x, mask=None):
        for layer in self.layers:
            x = layer(x, mask)
        return x
```

## 应用场景

### 1. BERT - 双向编码器

```python
class BERT(nn.Module):
    def __init__(self, vocab_size, d_model, num_layers, num_heads):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = PositionalEncoding(d_model)
        self.encoder = TransformerEncoder(num_layers, d_model, num_heads, d_model * 4)
        self.pooler = nn.Linear(d_model, d_model)
        
    def forward(self, input_ids, mask=None):
        x = self.embedding(input_ids)
        x = self.pos_encoding(x)
        x = self.encoder(x, mask)
        
        # [CLS] token的表示
        pooled = torch.tanh(self.pooler(x[:, 0]))
        return x, pooled
```

### 2. GPT - 生成式预训练

```python
class GPT(nn.Module):
    def __init__(self, vocab_size, d_model, num_layers, num_heads):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model)
        self.pos_encoding = PositionalEncoding(d_model)
        self.layers = nn.ModuleList([
            TransformerDecoderLayer(d_model, num_heads, d_model * 4)
            for _ in range(num_layers)
        ])
        self.lm_head = nn.Linear(d_model, vocab_size, bias=False)
        
    def forward(self, input_ids):
        x = self.embedding(input_ids)
        x = self.pos_encoding(x)
        
        for layer in self.layers:
            x = layer(x)
            
        return self.lm_head(x)
```

### 3. Vision Transformer (ViT)

```python
class ViT(nn.Module):
    def __init__(self, img_size=224, patch_size=16, num_classes=1000, d_model=768):
        super().__init__()
        self.num_patches = (img_size // patch_size) ** 2
        
        # Patch嵌入
        self.patch_embed = nn.Conv2d(3, d_model, kernel_size=patch_size, stride=patch_size)
        
        # CLs token和位置编码
        self.cls_token = nn.Parameter(torch.zeros(1, 1, d_model))
        self.pos_embed = nn.Parameter(torch.zeros(1, self.num_patches + 1, d_model))
        
        # Transformer编码器
        self.encoder = TransformerEncoder(12, d_model, 12, 3072)
        
        # 分类头
        self.head = nn.Linear(d_model, num_classes)
        
    def forward(self, x):
        # 提取patch
        x = self.patch_embed(x)  # [B, d_model, H/P, W/P]
        x = x.flatten(2).transpose(1, 2)  # [B, num_patches, d_model]
        
        # 添加cls token
        cls_tokens = self.cls_token.expand(x.shape[0], -1, -1)
        x = torch.cat([cls_tokens, x], dim=1)
        
        # 添加位置编码
        x = x + self.pos_embed
        
        # Transformer编码
        x = self.encoder(x)
        
        # 分类
        return self.head(x[:, 0])
```

## 训练技巧

### 1. 学习率调度

```python
def get_scheduler(optimizer, d_model, num_warmup_steps):
    def lr_lambda(step):
        if step < num_warmup_steps:
            return float(step) / float(max(1, num_warmup_steps))
        return max(0.1, float(num_warmup_steps ** 0.5) * float(step ** -0.5))
    
    return torch.optim.lr_scheduler.LambdaLR(optimizer, lr_lambda)
```

### 2. 标签平滑

```python
criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
```

### 3. 梯度裁剪

```python
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
```

## 总结

Transformer已成为NLP和CV领域的基础架构，值得深入学习。其核心的多头注意力机制为模型提供了强大的序列建模能力，是现代深度学习的重要里程碑。
