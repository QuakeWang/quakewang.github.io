---
title: "树——二叉树查找以及删除结点"
date: 2020-09-24T17:44:43+08:00
---

# 二叉树查找以及删除结点

## 一、前言

在上一篇blog中，我们了解了有关二叉树遍历的实现方法，其实，二叉树还可以用于查找关键字，和遍历一样，同样分成前中后三种方法查找。

本次内容除了介绍二叉树的遍历查找算法之外，考虑到由于篇幅不是很多，所以又增加了在二叉树中删除结点的方法。

---

## 二、算法实现

### 1、前序查找

思路：首先判断当前结点的关键字是否等于要查找的；如果是相等的，则返回当前结点，该结点，也就是我们所要查找的结点；如果不等， **则判断当前结点的左子结点是否为空** ，如果不为空，则递归前序查找；如果左递归前序查找，找到结点，则返回，否则继续判断，当前结点的右子结点是否为空，如果不为空，则继续向右递归前序查找。

**代码实现如下：**

```java
    /**
     * 前序遍历查找
     *
     * @param no 查找no
     * @return 如果找到就返回该Node，如果没有找到返回null
     */
    public HeroNode preOrderSearch(int no) {
        // 比较当前结点是不是
        if (this.no == no) {
            return this;
        }
        // 1、判断当前结点的左子结点是否为空，如果不为空，则递归前序查找
        // 2、如果做递归前序查找，找到结点，则返回
        HeroNode resNode = null;
        if (this.left != null) {
            resNode = this.left.preOrderSearch(no);
        }
        if (resNode != null) {// 说明左子树找到
            return resNode;
        }
        // 3、左递归前序查找，找到结点，则返回，否则继续判断
        // 4、当前结点的右子结点是否为空，如果不空，则继续向右递归前序查找
        if (this.right != null) {
            resNode = this.right.preOrderSearch(no);
        }
        return resNode;
    }
```

### 2、中序查找

思路：判断当前结点的左子结点是否为空，如果不为空，则递归中序查找；如果找到，则返回。如果没有找到。就和当前结点比较，如果是则返回当前结点，否则继续进行右递归的中序查找；如果右递归中序查找，找到返回该结点，否则返回null。

**代码实现如下：**

```java
    // 中序遍历查找
    public HeroNode infixOrderSearch(int no) {
        // 判断当前结点的左子结点是否为空，如果不为空，则递归中序查找
        HeroNode resNode = null;
        if (this.left != null) {
            resNode = this.left.infixOrderSearch(no);
        }
        if (resNode != null) {
            return resNode;
        }
        // 如果找到，则返回，如果没有找到就和当前结点比较，如果是则返回当前结点
        if (this.no == no) {
            return this;
        }
        // 否则继续进行右递归的中序查找
        if (this.right != null) {
            resNode = this.right.infixOrderSearch(no);
        }
        return resNode;
    }

```

### 3、后序查找

思路：判读当前结点的左子结点是否为空，如果不为空，则递归后序查找；如果找到，就返回，如果没有找到，就判断当前结点的右子结点是否为空，如果不为空，则右递归进行后序查找，如果找到，就返回；否则 就和当前结点进行比较，如果是则返回该结点，否则返回null。

**代码实现如下：**

```java
    // 后序遍历查找
    public HeroNode postOrderSearch(int no) {
        HeroNode resNode = null;
        // 判断当前结点的左子结点是否为空，如果不为空，则递归后序查找
        if (this.left != null) {
            resNode = this.left.postOrderSearch(no);
        }
        if (resNode != null) {// 说明左子树找到
            return resNode;
        }
        // 如果左子树没有找到，则向右子树递归进行后序遍历查找
        if (this.right != null) {
            resNode = this.right.preOrderSearch(no);
        }
        if (resNode != null) {
            return resNode;
        }
        // 如果左右子树都没有找到，就比较当前结点是不是
        if (this.no == no) {
            return this;
        }
        return resNode;
    }
```

### 4、删除结点

分析：

在删除之前，我们要思考一个问题，那就是所需要删除的结点时叶子结点还是非叶子结点，如果是叶子结点，则直接删除即可；对于非叶子结点我们在这里做如下处理：那就是删除连同该结点的一棵树。

思路：

①因为该二叉树是单向的，所以判断的是当前结点的子结点是否为需要删除的结点，而不是直接判断需要删除的当前结点（如果直接判断需要删除的当前结点，那么当指针指向该结点的时候，由于是单向的二叉树，则已经错过了删除的机会。）

②如果当前结点的左子结点不为空，并且左子结点就是需要删除的结点，就将 `this.left = null` 并且返回（结束递归删除）；

③如果当前结点的右子结点不为空，并且右子结点就是需要删除的结点，就将 `this.right = null` 并且返回（结束递归删除）；

④如果第2和第3步没有删除结点，那么就需要向左子树进行递归删除；

⑤如果第4步也没有删除结点，则应当向右子树进行递归删除。

**代码实现如下：**

```java
    public void delNode(int no) {
        if (this.left != null && this.left.no == no) {
            this.left = null;
            return;
        }
        if (this.right != null && this.right.no == no) {
            this.right = null;
            return;
        }

        if (this.left != null) {
            this.left.delNode(no);
        }
        if (this.right != null) {
            this.right.delNode(no);
        }
    }
```



---

## 三、结束语

利用递归来实现二叉树查找关键字，总体上来说，还是比较便于理解的。在查找的基础上新加了删除结点的方法。

源码 ——> [二叉树查找](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/tree/BinaryTreeDemo.java)