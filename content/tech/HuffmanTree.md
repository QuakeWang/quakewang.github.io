---
title: "数据结构——赫夫曼树"
date: 2021-01-19T17:36:47+08:00

---

# 赫夫曼树

## 一、前言

### 1、基本介绍

-    给定 n 个权值作为 n 个叶子结点，构造一颗二叉树，**若该树的带权路径（wpl）达到最小** ，称这样的二叉树为最优二叉树，也称为赫夫曼树（Huffman Tree）；
-    赫夫曼树是带权路径长度最短的树，权值较大的结点离根较近。

### 2、重要概念

-    **路径和路径长度：** 在一棵树中，从一个结点往下可以达到的孩子或孙子结点之间的通路，称为路径；通路中分支的数目称为路径的长度；若规定根结点的层数为1，则从根结点到第L层结点的路径长度为 L - 1；
-    **结点的权以及带权路径的长度：** 若将树中结点赋给一个有着某种含义的数值，则这个数值称为该结点的权；结点的带权路径的长度为：从根结点到该结点之间的路径长度与该结点的权的乘积；
-    **树的带权路径长度：** 树的带权路径长度规定为所有叶子结点的带权路径长度之和，记为WPL（weighted path length），权值越大的结点离根结点越近的二叉树才是最优二叉树；
-    **WPL最小的就是赫夫曼树**。

---

## 二、案例分析

**要求：** 给一个数列{13, 7, 8, 3, 29, 6, 1}，转成一颗赫夫曼树。

### 1、思路分析

1）从小到大进行排序，将每一个数据（每个数据就是一个结点），每个结点都可以看成是一颗最简单的二叉树；

2）取出根结点权值最小的两颗二叉树；

3）组成一颗新的二叉树，该新的二叉树的根结点的权值是前面两颗二叉树根结点权值的和；

4）再将这颗新的二叉树，以根结点的权值大小，依次排序，不断重复 1-2-3-4步骤，直到所有数据都被处理，就得到一颗赫夫曼树。

### 2、图解

*其中蓝色的结点表示数列中需要调整的结点，绿色表示新生成的结点*

![HuffmanTree](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/HuffmanTree01.png?raw=true)

---

## 三、代码实现

### 1、结点类Node

#### ①定义基础变量及说明

该类用于定义结点属性，以及相关实现方法。由于需要对Node结点进行排序，这里引入 **Collections** 集合排序，实现 **Comparable**。

**代码实现如下：**

```java
// 创建类结点
// 为了让Node对象持续排序 Collections 集合排序，实现 Comparable 接口
class Node implements Comparable<Node> {
    int value;// 结点权值
    Node left;// 指向左子结点
    Node right;// 指向右子结点

    // 构造器
    public Node(int value) {
        this.value = value;
    }
  
   @Override
    public String toString() {
        return "Node{" +
                "value=" + value +
                '}';
    }
}
```

#### ②前序遍历方法

这里我们使用前序遍历输出赫夫曼树。

根据前序遍历的框架，首先输出当前结点，然后判断左子结点是否为空，如果不为空则递归输出；最后判断右子结点是否为空，如果不为空，递归输出即可。

**代码实现如下：**

```java
    // 前序遍历
    public void preOrder() {
        System.out.println(this);
        if (this.left != null) {
            this.left.preOrder();
        }
        if (this.right != null) {
            this.right.preOrder();
        }
    }
```

####  ③compareTo函数

利用 **compareTo函数** 对结点进行排序，按照从小到大进行排序。

```java
    @Override
    public int compareTo(Node node) {
        // 表示从小到大排序
        return this.value - node.value;
    }
```


### 2、HuffmanTree类（主类）

#### ①重载前序遍历方法

重载**Node结点类**的 **preOrder()方法** ，加上判断条件，如果为空，则输出相关信息即可。

**代码实现如下：**

```` java
    // 编写一个前序遍历的方法
    public static void preOrder(Node root) {
        if (root != null) {
            root.preOrder();
        } else {
            System.out.println("是空树，无法完成遍历~~~");
        }
    }
````

#### ②创建赫夫曼树方法

该方法也是本次内容的重点了，接下来，我们细细分析。先说明：需要一个创建赫夫曼树的数组，创建好赫夫曼树之后，以root结点进行返回。

拿到数组之后，我们需要做的第一件事就是，遍历arr数组，将arr的每个元素构成一个Node，最后将Node放入到ArrayList中。

```java
        ArrayList<Node> nodes = new ArrayList<>();
        for (int value : arr) {
            nodes.add(new Node(value));
        }
```

经过上述处理之后，我们就得到了一个nodes，紧接着对此进行展开操作。前面提到，我们需要对数组进行从小到大的排序，所以`Collections.sort(nodes);` 

**形成赫夫曼树的操作：**

1）取出权值最小的结点（二叉树），*因为经过排序，所以下标为0的结点就是最小的；*

2）取出权值第二小的结点（二叉树）；

3）构建一棵新的二叉树，*新二叉树的权值为左子结点和右子结点的权值之和*；

4）从ArrayList删除处理过的二叉树，*直接使用remove方法即可*；

5）将parent结点加入到nodes中。

**代码实现如下：**

```java
    /**
     * 创建哈夫曼树的方法
     *
     * @param arr 需要创建哈夫曼树的数组
     * @return 创建好后的哈夫曼树的root结点
     */
    public static Node createHuffmanTree(int[] arr) {
        /**
         * 1、遍历arr数组；
         * 2、将arr的每个元素构成一个Node
         * 3、将Node放入到ArrayList中
         */
        ArrayList<Node> nodes = new ArrayList<>();
        for (int value : arr) {
            nodes.add(new Node(value));
        }

        // 进行循环处理
        while (nodes.size() > 1) {
            // 排序 从小到大
            Collections.sort(nodes);

            System.out.println("nodes = " + nodes);

            // 取出根结点权值最小的两棵二叉树
            // 1、取出权值最小的结点（二叉树）
            Node leftNode = nodes.get(0);
            // 2、取出权值第二小的结点（二叉树）
            Node rightNode = nodes.get(1);
            // 3、构建一颗新的二叉树
            Node parent = new Node(leftNode.value + rightNode.value);
            parent.left = leftNode;
            parent.right = rightNode;
            // 4、从ArrayList删除处理过的二叉树
            nodes.remove(leftNode);
            nodes.remove(rightNode);
            // 5、将parent结点加入到nodes中
            nodes.add(parent);
        }
        // 返回哈夫曼树的root结点
        return nodes.get(0);
    }
```

----

## 四、结束语

经过以上的操作，我们就完成了一棵赫夫曼树，根据赫夫曼的特点，有一种编码叫做赫夫曼编码，这个因为牵涉到的代码量较大，我们就有时间再说。

此外，对于赫夫曼树的测试主方法，并没有说明，小朋友们可以自行完善。

源码地址 ——> [HuffmanTree](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/huffmantree/HuffmanTree.java)

