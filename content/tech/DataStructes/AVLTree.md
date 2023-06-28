---
title: "AVLTree"
date: 2020-12-06T23:03:53+08:00
draft: true
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

所以根据以上出现的问题，也就有了我们今天的主角：**平衡二叉树**。

### 2、基本介绍

平衡二叉树，也叫平衡二叉搜索树，又被称为 **AVL树**，可以保证有较高的查询效率。同时具有以下特点：它是**一棵空树** 或 **它的左右两个子树的高度差的绝对值不超过1**，并且 **左右两个子树都是一棵平衡二叉树**。

平衡二叉树的常用实现方法有红黑树、AVL、替罪羊树、Treap、伸展树等。

下面我们将结合具体的实例，来一探平衡二叉树的究竟！！！

## 二、案例分析

### 1、应用案例——左旋转

1）要求：给你一个数列，创建出对应的平衡二叉树，数列{4, 3, 6, 5, 7, 8}

2）思路分析：

问题：当插入 8 时， `rightHeight() - leftHeigth() > 1 ` 成立，此时，不再是一颗AVL树了，因此我们需要怎么处理才能达到想要的效果呢？ ——> **左旋转**

-    创建一个新的结点 `newNode` （*以4这个值创建*），值等于当前根结点的值；
-    把新结点的左子树设置成当前结点的左子树，`newNode.left = left;`
-    把新结点的右子树设置为当前结点的右子树的左子树，`newNode.right = right.left;`
-    把当前结点的值换为右子结点的值，`value = right.value;`
-    把当前结点的右子树设置成右子树的右子树，`right = right.right;`
-    把当前结点的左子树设置为新结点，`left = newNode;`

好了，完成了以上的操作，这时就已经成为了一颗AVL树，但是相信很多小伙伴读到这里，肯定很迷，不急不急请看下图：

![LeftROtate](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/LeftRotate.png?raw=true)

### 2、应用案例——右旋转

相信结合左旋转的代码和图片，大家已经可以完成了该操作。接下来我们来看看右旋转，其实说白了就是把左旋转 "反过来" 。

1）要求：给你一个数列，创建出对应的平衡二叉树，数列{10, 12, 8, 9, 7, 6}

2）思路分析：

问题：当插入 6 时， `leftHeight() - rightHeigth() > 1 ` 成立，此时，不再是一颗AVL树了，因此我们需要怎么处理才能达到想要的效果呢？ ——> **右旋转**

-    创建一个新的结点 `newNode` （*以4这个值创建*），值等于当前根结点的值；
-    把新结点的右子树设置成当前结点的右子树，`newNode.right = right;`
-    把新结点的左子树设置为当前结点的左子树的右子树，`newNode.left = left.right;`
-    把当前结点的值换为左子结点的值，`value = left.value;`
-    把当前结点的左子树设置成左子树的左子树，`left = left.left;`
-    把当前结点的右子树设置为新结点，`right = newNode;`

![RightRotate](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/RightRotate.png?raw=true)

### 3、应用案例——双旋转

你以为到这就结束了，想的太简单点了吧，还有一种情况就是只使用一次左旋转或者右旋转是达不到效果的，那就得进行双旋转咯。比如数列：`int[] arr = {10, 11, 7, 6, 8, 9};` 运行原来的代码可以看见，并没有转成AVL树。这时我们就需要对问题进行剖析了：

**解决思路：** 

-    当符合右旋转的条件时
-    如果它的左子树的右子树高度大于它的左子树的高度
-    先对当前这个结点的左结点进行左旋转
-    再对当前结点进行右旋转的操作即可。

![AVL](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/AVLTree.png?raw=true)

---

## 三、代码实现

### 1、返回以该结点为根结点树的高度

在比较两个结点的左右子树的差值的时候，我们首先需要获取当前根结点的高度。

使用Java内置的Math类库的max方法，从而返回较大的数值。这里我们对于左子树进行说明，（*右子树也是同理*），`left == null ? 0 : left.height()` 使用三目运算符，先判断left是否为空，如果为空，直接返回null，否则递归的遍历左子树。

```java
    // 返回以该结点为根结点树的高度
    public int height() {
        return Math.max(left == null ? 0 : left.height(), right == null ? 0 : right.height()) + 1;
    }
```

### 2、返回左子树的高度

先判断左子树是否为空 `if(left == null)`，如果为空直接返回为0，否则调用`height()` 方法。

```java
    // 返回左子树的高度
    public int leftHeight() {
        if (left == null) {
            return 0;
        }
        return left.height();
    }
```

### 3、返回右子树的高度

和左子树同理。

```java
    // 返回右子树的高度
    public int rightHeight() {
        if (right == null) {
            return 0;
        }
        return right.height();
    }
```

### 4、左右旋转方法

在案例分析中，已经阐述了该方法的原理，这里就不做过多的赘述，直接上代码。

```java
    // 左旋转方法
    private void leftRotate() {
        // 创建新的结点，以当前根结点的值
        Node newNode = new Node(value);
        // 把新的结点的左子树设置成当前结点的左子树
        newNode.left = left;
        // 把新的结点的右子树设置成当前结点的右子树的左子树
        newNode.right = right.left;
        // 把当前结点的值替换成右子结点的值
        value = right.value;
        // 把当前面结点的右子树设置成当前结点右子树的右子树
        right = right.right;
        // 把当前结点的左子树（左子结点）设置成新的结点
        left = newNode;
    }

    // 右旋转方法
    private void rightRotate() {
        // 创建新的结点，以当前根结点的值
        Node newNode = new Node(value);
        // 把新的结点的右子树设置成当前结点的右子树
        newNode.right = right;
        // 把新的结点的左子树设置成当前结点的左子树的右子树
        newNode.left = left.right;
        // 把当前结点的值替换成左子结点的值
        value = left.value;
        // 把当前结点的左子树设置成当前结点的左子树的左子树
        left = left.left;
        // 把当前结点的右子树（右子结点）设置成新结点
        right = newNode;
    }
```

### 5、添加结点

我们关于旋转方法的使用，是在添加结点的方法中实现。添加结点方法是基于[二叉排序树](https://quakewang.github.io/tech/bst/)的基础上完善的，如果还不了解的小伙伴可以去看上一篇博客。

```java
    // 添加结点
    public void add(Node node) {
        if (node == null) {
            return;
        }
        // 判断传入结点的值和当前子树根结点值的关系
        if (node.value < this.value) {
            // 如果当前结点的左子结点为null
            if (this.left == null) {
                this.left = node;
            } else {
                // 递归的向左子树添加
                this.left.add(node);
            }
        } else {// 传入结点的值大于当前结点
            if (this.right == null) {
                this.right = node;
            } else {
                // 递归的向右子树添加
                this.right.add(node);
            }
        }

        // 当添加一个结点后，如果：（右子树的高度 - 左子树的高度）> 1，左旋转
        if (rightHeight() - leftHeight() > 1) {
            // 如果它的右子树的左子树的高度大于它右子树的右子树高度
            if (right != null && right.leftHeight() > right.rightHeight()) {
                // 先对右子树进行旋转
                right.rightRotate();
                // 然后再对当前结点进行左旋转
                leftRotate();// 左旋转
            } else {
                // 直接进行左旋转
                leftRotate();
            }
            return;// 必须要！！！
        }

        // 当添加完一个结点后，如果（左子树的高度 - 右子树的高度）> 1，右旋转
        if (leftHeight() - rightHeight() > 1) {
            // 如果它的左子树的右子树的高度大于它的左子树的左子树的高度
            if (left != null && left.rightHeight() > left.leftHeight()) {
                // 先对左子结点进行右旋转
                left.leftRotate();
                // 然后再对当前结点进行右旋转
                rightRotate();
            } else {
                // 直接进行右旋转
                rightRotate();
            }
        }
    }
```

---



## 四、结束语

到此，关于AVL树的相关操作我们已经完成，但对于遍历、输出等函数这里并没有进行相关说明，因为这些方法在前面已经说过很多类似的了，所以就把内容更侧重于关于具体问题算法的实现。

*说实话，有的时候不push自己，可能永远不会继续写下去*

源码地址 ——>[AVLTree](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/avl/AVLTreeDemo.java)
