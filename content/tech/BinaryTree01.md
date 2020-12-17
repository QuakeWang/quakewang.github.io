---
title: "树——二叉树遍历"
date: 2020-09-21T20:36:46+08:00
---

# 遍历二叉树

## 一、前言

在上一篇blog中，我们了解了有关树的基础知识，特别的是重点介绍了一下二叉树。这里，我们就来探究一下关于二叉树的遍历方法。

二叉树的遍历方法有三种，分别是：

-    前序遍历：先输出父结点，在遍历左子树和右子树；
-    中序遍历：先遍历左子树，再输出父结点，再遍历右子树；
-    后序遍历：先遍历左子树，再遍历左子树 ，再输出父结点。

小结：看输出父结点的顺序，就确定是前序，中序还是后序。

---

## 二、算法实现

### 1、前序遍历

1.   先输出当前结点（初始的时候是根节点）；
2.   如果左子结点不为空，则递归继续前序遍历；
3.   如果右子结点不为空，则递归继续前序遍历。

**代码实现如下：**

```java
    // 编写前序遍历的方法
    public void preOrder() {
        System.out.println(this);// 先输出父结点
        // 递归向左子树前序遍历
        if (this.left != null) {
            this.left.preOrder();
        }
        // 向右子树前序遍历
        if (this.right != null) {
            this.right.preOrder();
        }
    }
```



### 2、中序遍历

1.   如果当前结点的左子结点不为空，则递归中序遍历；
2.   输出当前结点；
3.   如果当前结点的右子结点不为空，则递归中序遍历。

**代码实现如下：**

```java
    // 中序遍历
    public void infixOrder() {
        // 递归向左子树中序遍历
        if (this.left != null) {
            this.left.infixOrder();
        }
        // 输出父结点
        System.out.println(this);
        // 递归向右子树中序遍历
        if (this.right != null) {
            this.right.infixOrder();
        }
    }
```



### 3、后序遍历

1.   如果当前结点的左子结点不为空，则递归后序遍历；
2.   如果当前节点的右子结点不为空，则递归中序遍历；
3.   输出当前结点。

**代码实现如下：**

```java
    // 后序遍历
    public void postOrder() {
        if (this.left != null) {
            this.left.postOrder();
        }
        if (this.right != null) {
            this.right.postOrder();
        }
        System.out.println(this);
    }
```



---

## 三、结束语

其实遍历二叉树，可以进行利用递归和非递归两种方式来处理，我们这里使用的是递归的方式，个人感觉，在明白递归机制之后，递归实现更容易理解点吧。

源码 ——>[二叉树](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/tree/BinaryTreeDemo.java)