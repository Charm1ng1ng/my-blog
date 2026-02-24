---
title: 论文：ViT视觉Transformer详解
date: 2026-02-23 15:30
type: projects
categories: 论文
tags: [Transformer, NLP, Attention, 论文]
---
Vision Transformer (ViT) 是将Transformer架构应用于计算机视觉领域的里程碑式工作。

<!--more-->

## 论文概述

ViT（Vision Transformer）由Google Brain团队于2020年提出，首次将NLP领域的Transformer成功应用于图像分类任务，打破了CNN在视觉领域的统治地位。

## 核心思想

### 1. 图像分块

将输入图像分割成固定大小的patch：

```
原始图像: H × W × C
分块后: N = (H×W) / P² 个 patches
每个patch: P × P × C
```

### 2. Patch Embedding

通过线性投影将每个patch映射为embedding：

```python
class PatchEmbedding(nn.Module):
    def __init__(self, img_size=224, patch_size=16, in_channels=3, embed_dim=768):
        super().__init__()
        self.proj = nn.Conv2d(in_channels, embed_dim, 
                              kernel_size=patch_size, 
                              stride=patch_size)
    
    def forward(self, x):
        # x: [B, C, H, W]
        x = self.proj(x)  # [B, embed_dim, H/P, W/P]
        x = x.flatten(2).transpose(1, 2)  # [B, num_patches, embed_dim]
        return x
```

### 3. 位置编码与CLS token

添加可学习的位置编码和分类token：

```python
def forward(self, x):
    x = self.patch_embed(x)  # [B, num_patches, embed_dim]
    cls_token = self.cls_token.expand(x.shape[0], -1, -1)
    x = torch.cat([cls_token, x], dim=1)
    x = x + self.pos_embed
    return self.norm(x)
```

## 实验结果

| Model | ImageNet Top-1 | Params |
|-------|----------------|--------|
| ViT-B/16 | 77.9% | 86M |
| ViT-L/16 | 76.5% | 307M |
| DeiT-B | 81.8% | 86M |

## 总结

ViT证明了Transformer在视觉任务上的强大潜力，开启了视觉Transformer时代的大门。
