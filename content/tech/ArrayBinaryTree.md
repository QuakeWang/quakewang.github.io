---
title: "树——顺序存储二叉树遍历"
date: 2020-09-28T13:47:41+08:00
---

# 顺序存储二叉树遍历

## 一、前言

### 1、顺序存储二叉树的概念

#### ①基本说明

从数据存储来看，数组存储方式和树的存储方式可以相互转换，即 **数组可以转换成数。数也可以转换成数组** ，如下图：

![ArrayBinaryTree](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/ArrayBinaryTree01.png?raw=true)

#### ②要求

-    上图的二叉树的结点，要求以数组的方式来存放，arr = [1,2,3,4,5,6,7]；
-    要求在遍历数组arr时，仍然可以使用前序遍历、中序遍历和后序遍历的方式完成结点的遍历。

### 2、顺序存储二叉树的特点

-    顺序二叉树通常只考虑完全二叉树；
-    第n个元素的左子结点为 2*n + 1；
-    第n个元素的右子结点为 2*n + 2；
-    第n个元素的父结点为 (n - 1) / 2；
-    n：表示二叉树中的第几个元素（按0开始编号如上图）。

---

## 二、算法实现

### 1、顺序存储二叉树的前序遍历

首先，我们需要判断所给的数组是否符合条件，如果 **数组为空** 则，无法完成遍历，并给出相关提示；接下来，我们就按照前序遍历的法则，先输出当前这个元素，再向左递归遍历，最后向右递归遍历即可。

需要注意的是：在向左和向右遍历的时候需要先判断索引所在的位置，是否在数组之内，如果是数组之外，就无法完成遍历；其次就是需要注意递归时候开始的索引。根据顺序存储二叉树的特点。

**代码实现如下：**

```java

    /**
     * 编写一个方法，实现顺序存储二叉树的前序遍历
     *
     * @param index 数组的下标
     */
    public void preOrder(int index) {
        // 先判断数组是否为空
        if (arr == null || arr.length == 0) {
            System.out.println("数组为空，无法完成相关遍历");
        }
        // 输出当前这个元素
        System.out.println(arr[index]);
        // 向左递归遍历
        if ((index * 2 + 1) < arr.length) {
            preOrder(index * 2 + 1);
        }
        // 向右递归遍历
        if ((index * 2 + 2) < arr.length) {
            preOrder(2 * index + 2);
        }
    }
```

### 2、顺序存储二叉树的中序遍历

和前序遍历相类似，只不过在进行输出和递归时候的位置发生交换。先进行左递归，然后输出当前结点，最后向右递归遍历。

**代码实现如下：**

```java
    // 顺序存储二叉树的中序遍历
    public void infixOrder(int index) {
        // 先判断数组是否为空
        if (arr == null || arr.length == 0) {
            System.out.println("数组为空，无法完成相关遍历");
        }
        // 向左递归遍历
        if ((index * 2 + 1) < arr.length) {
            infixOrder(index * 2 + 1);
        }
        // 输出当前这个元素
        System.out.println(arr[index]);
        // 向右递归遍历
        if ((index * 2 + 2) < arr.length) {
            infixOrder(index * 2 + 2);
        }
    }
```

### 3、顺序存储二叉树的中序遍历

和前序、中序遍历一样，顺序更改为：先向左递归遍历，然后向右递归遍历，最后输出当前结点。

**代码实现如下：**

```java
    // 顺序存储二叉树的后序遍历
    public void postOrder(int index) {
        // 先判断数组是否为空
        if (arr == null || arr.length == 0) {
            System.out.println("数组为空，无法完成相关遍历");
        }
        // 向左递归遍历
        if ((index * 2 + 1) < arr.length) {
            postOrder(index * 2 + 1);
        }
        // 向右递归遍历
        if ((index * 2 + 2) < arr.length) {
            postOrder(index * 2 + 2);
        }
        // 输出当前这个元素
        System.out.println(arr[index]);
    }
```

---

## 三、结束语

利用数组的顺序存储来实现二叉树，其遍历方法和普通的二叉树来说，并无差别需要注意的就是索引的起始位置。，牢记顺序存储二叉树的特点即可。

源码 ——> [顺序存储二叉树](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/tree/ArrBinaryTreeDemo.java)

 