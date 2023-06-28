---
title: "树——线索化二叉树"
date: 2020-10-07T14:27:50+08:00
draft: true
---

# 线索化二叉树

## 一、前言

### 1、问题引入

现如今我们在生活上都提倡节约环保，所以对于我们的所写的代码也不例外，能节省时间或空间，我们就应该去考虑节省。我们来思考一下二叉树的结构：

![ThreadedBinaryTree01](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/ThreadedBinaryTree01.png?raw=true)

二叉树的中序遍历结果为HDIBJEAFCG，可以得知A的前驱结点为E，后继结点为F。但是，这种关系的获得是建立在完成遍历后得到的，那么可不可以在建立二叉树时就记录下前驱后继的关系呢，那么在后续寻找前驱结点和后继结点时将大大提升效率。

还有就是我们可以观察到，EFGHIJ等结点都存在空的指针域，这样的话会造成空间上的浪费，所以该如何做，才能有效的处理这些问题呢？？

那也就是我们今天的重点内容—— **线索化二叉树** 。

### 2、线索化二叉树基本介绍

-    n个结点的二叉链表含有 **n + 1** 个空指针域。利用二叉链表中的空指针域存放指向该结点在某种遍历次序下的前驱和后继结点的指针，这种附加的指针称为“线索”；
-    这种加上了线索的二叉链表称为线索链表，相应的二叉树称为线索化二叉树，根据线索性质不同，可以分为：前序线索二叉树、中序线索二叉树（ *我们这里使用中序进行讲解* ）以及后序线索二叉树三种；
-    一个结点的前一个结点，称为 **前序结点** ；
-    一个结点的后一个结点，称为 **后继结点** 。

### 3、线索化规则

现将某结点的空指针域指向该结点的前驱后继，定义规则如下：

>    若结点的左子树为空，则该结点的做孩子指针指向其前驱结点；
>
>    若结点的右子树为空，则该结点的右孩子指针指向其后继结点。

根据这个规则，我们将上图线索化之后，如下：

![ThreadedBinaryTree02](https://github.com/QuakeWang/quakewang.github.io/blob/master/content/imag/ThreadedBinaryTree02.png?raw=true)

图中黑色虚线为指向后继的线索，紫色虚线为指向前序的线索。可以看出通过线索化，即解决了空间浪费问题，又解决了前驱后继的记录问题。

---

## 二、算法实现

### 1、创建结点

既然我们需要实现线索化二叉树，所以需要先创建一个HeroNode类表示结点，包含的属性有：`int no;// 表示编号` 、`String name;// 表示姓名`、`HeroNode left;// 表示左子结点，默认为null` 、`HeroNode right;// 表示右子结点，默认为null` 。

除了上述的基本变量之外，我们还要定义两个类型变量，用于判断指向的是左子树（右子树）还是前驱（后继）结点。*我们在这里规定0表示指向树，1表示指向结点。*

定义好上述变量之后，还有就是相关的get以及set方法，外加一个toString方法用于显示信息。

**代码实现如下：**

```java
// 创建HeroNode结点
class HeroNode {
    private int no;
    private String name;
    private HeroNode left;// 默认为null
    private HeroNode right;// 默认为null

    /*
    说明：
        1、如果leftType == 0 表示指向的是左子树，如果1则表示是前驱结点
        2、如果rightType == 0 表示指向的是右子树，如果1则表示指向后继结点
     */
    private int leftType;
    private int rightType;

    // 构造器
    public HeroNode(int no, String name) {
        this.no = no;
        this.name = name;
    }

    public HeroNode getLeft() {
        return left;
    }

    public void setLeft(HeroNode left) {
        this.left = left;
    }

    public int getLeftType() {
        return leftType;
    }

    public void setLeftType(int leftType) {
        this.leftType = leftType;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getNo() {
        return no;
    }

    public void setNo(int no) {
        this.no = no;
    }

    public HeroNode getRight() {
        return right;
    }

    public void setRight(HeroNode right) {
        this.right = right;
    }

    public int getRightType() {
        return rightType;
    }

    public void setRightType(int rightType) {
        this.rightType = rightType;
    }

    @Override
    public String toString() {
        return "HeroNode{" +
                " name='" + name + '\'' +
                ", no=" + no +
                '}';
    }
}
```

### 2、实现线索化

为了实现线索化，我们首先需要创建一个指向当前结点的前驱结点的指针pre（*默认为null*），这样从而使得，在递归进行线索化的时候，pre总是保留前一个结点。以及定义一个根结点root。

下面开始执行线索化方法体threadedNodes：先判断传入的结点是否为空，如果为空，则无法进行线索化；由于中序遍历的顺序为：左、中、右。所以我们按照这个顺序编写代码，使用递归的方式。

①**线索化左子树** ：`threadedNodes(node.getLeft());`

②**线索化当前结点** ：这个是重中之重，也是难点所在。先处理当前结点的前驱结点（ *先将当前结点的左指针设置为pre，然后再修改左指针的类型，指向前驱结点* ），接着处理后继结点（ *先将当前结点的右指针指向当前结点，然后再修改右指针的类型* ），在完成以上步骤之后，也就处理完成一个结点，然后让当前结点指向下一个结点的前驱结点 `pre = node`；

③**线索化右子树** ：`threadedNodes(node.getRight());` 。

**代码实现如下：**

```java
// 定义ThreadedBinaryTree
class ThreadedBinaryTree {
    private HeroNode root;

    // 为了实现线索化，需要创建要给指向当前结点的前驱结点的指针
    // 在递归进行线索化时，pre总是保留前一个结点
    private HeroNode pre = null;

    public void setRoot(HeroNode root) {
        this.root = root;
    }

    //重载threadNodes方法
    public void threadedNodes() {
        this.threadedNodes(root);
    }

    public void threadedNodes(HeroNode node) {
        // 如果node == null 不能线索化
        if (node == null) {
            return;
        }

        // （一）先线索化左子树
        threadedNodes(node.getLeft());

        // （二）线索化当前结点【难点】
        // 处理当前结点的前驱结点
        if (node.getLeft() == null) {
            // 当前结点的左指针
            node.setLeft(pre);
            // 修改当前结点的左指针的类型，指向前驱结点
            node.setLeftType(1);
        }
        // 处理后继结点
        if (pre != null && pre.getRight() == null) {
            // 让前驱结点的右指针指向当前结点
            pre.setRight(node);
            // 修改前驱结点的右指针类型
            node.setRightType(1);
        }
        // ！！！每处理一个结点后。让当前结点指向下一个结点的前驱结点
        pre = node;

        // （三）再线索化右子树
        threadedNodes(node.getRight());
    }
}
```

---

## 三、结束语

从上面的分析我们可以看出，由于它充分利用空指针域的空间（这等于节省了空间），又保证了创建时的一次遍历就可以终生受用前驱后继的信息（这意味着省了时间）。所以在实际问题中，**如果所用的二叉树需经常遍历或查找结点时需要某种遍历序列中的前序和后继，那么采用线索化二叉树就是一个非常不错的选择咯！**

源码 ——>[线索化二叉树](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/tree/threadedbinarytree/ThreadedBinaryTreeDemo.java)