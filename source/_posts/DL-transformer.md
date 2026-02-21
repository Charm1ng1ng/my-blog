---
title: Transformer深度学习模型详解
date: 2026-02-22 08:00:00
categories: 深度学习
tags: [Transformer, NLP, Attention]
---

## 背景

Transformer模型由Vaswani等人于2017年提出，完全基于注意力机制，摒弃了传统的RNN和CNN结构。

## 核心架构

### 多头注意力机制

$$Attention(Q, K, V) = softmax(\frac{QK^T}{\sqrt{d_k}})V$$

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
    
    def forward(self, Q, K, V, mask=None):
        batch_size = Q.size(0)
        Q = self.W_q(Q).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        K = self.W_k(K).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        V = self.W_v(V).view(batch_size, -1, self.num_heads, self.d_k).transpose(1, 2)
        
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn = torch.softmax(scores, dim=-1)
        output = torch.matmul(attn, V)
        return self.W_o(output.transpose(1, 2).contiguous().view(batch_size, -1, self.num_heads * self.d_k))
```

### 位置编码

```python
class PositionalEncoding(nn.Module):
    def __init__(self, d_model, max_len=5000):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len).unsqueeze(1).float()
        div_term = torch.exp(torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model))
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe.unsqueeze(0))
    
    def forward(self, x):
        return x + self.pe[:, :x.size(1)]
```

## 应用场景

- BERT、GPT系列模型
- 机器翻译
- 文本生成
- 图像分类(ViT)

## 总结

Transformer已成为NLP和CV领域的基础架构，值得深入学习。
