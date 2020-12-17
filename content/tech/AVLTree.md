---
title: "AVLTree"
date: 2020-12-06T23:03:53+08:00
---

# 二叉平衡树

## 一、前言

### 1、案例分析

现在有一个数列 `{1, 2, 3, 4, 5, 6}`，要求创建一颗二叉排序树，并分析问题所在。

**左边BST存在的问题分析：**

-    左子树全部为空，从形式上看，更像是一个单链表；
-    插入速度没影响；
-    查询速度明显降低（因为需要依次比较），不能发挥BST的优势，因为每次还需要比较左子树，导致其查询速度比单链表还慢。

如下图：

![AVLTree01](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/AVLTree01.png?raw=true)



