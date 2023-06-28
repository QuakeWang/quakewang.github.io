---
title: "二叉排序树"
date: 2020-11-22T20:18:41+08:00
draft: true
---

# 二叉排序树

## 一、前言

### 1、引子

假设现在有一个数组`{7, 3, 10, 12, 5, 1, 9}` ，现在要求能够高效的完成对数据的添加、删除以及查询操作。

根据我们之前所学过得内容，假设查找的数据集是普通的顺序存储，那么插入操作就是将记录放在表的末端，给表记录数加一即可，删除操作可以是删除后，后面的记录向前移，也可以是要删除的元素与最后一个元素互换，表记录数减一，反正整个数据集也没有固定的顺序，进行这样的操作的话，效率也还说得过去。准确来说，应该是，插入和删除对于顺序存储结构来说，效率还是可以接受的，但这样的表由于无序会造成查找的效率很低。

如果需要查找的是一个有序线性表，并且是顺序是线性存储的，查找的话就可以使用[折半](https://quakewang.github.io/tech/binarysearch/)、[插值](https://quakewang.github.io/tech/insertvaluesearch/)、[斐波那契](https://quakewang.github.io/tech/fibonaccisearch/) 等等查找算法来实现，可惜的是，因为是有序，在插入和删除操作上就不太方便，可能需要一移动大量的数据，耗费大量的时间。

那么，有没有一种既可以使得插入和删除效率不错，又可以比较高效率地实现茶轴的算法呢？？这也就是我们今天所要说的**二叉排序树(BinarySortTree)** 。

### 2、二叉排序树介绍

**二叉排序树(Binary Sort Tree)** ： 又称为二叉查找树。它或者是一棵空树，或者具有下列性质的二叉树：

-    若它的左子树不空，则左子树上所有的结点的值均小于它的根结点的值；
-    若它的右子树不空，则右子树上所有的结点的值均小于它的根结点的值；
-    它的左、右子树也分别为二叉排序树。

*特别说明：如果有相同的值，可以将该结点放在左结点或者右结点* 

比如针对前面的数据`{7, 3, 10, 12, 5, 1, 9}` ，我们再另外插入一个结点 2，对应的二叉树如下：

![bst01](https://github.com/QuakeWang/Figure-bed/blob/master/DataStructures/bst.png?raw=true)

从二叉排序树的定义也可以知道，它前提是二叉树，然后它采用了递归的定义方法，另外，它的结点之间满足一定的次序关系，左子树结点一定比其双亲结点小，右子结点一定比其双亲结点大。

构造一棵二叉树的目的，其实并不是为了排序，而是为了提高查找和插入删除关键字的速度。不管怎么说，在一个有序数据集上的查找，速度总是要快于无序的数据集，而二叉排序树这种非线性的结构，也有利于插入和删除的实现。

### 二、算法实现

由于考虑到BST算法的复杂性，所以使用两个类来完成操作，`class Node` 用于表示结点以及完成一些有关的基本方法，比如：添加结点、遍历等方法；`class BinarySortTree` 用于封装 **Node** 类中的方法，以及更具体的完成相关方法体的操作。

#### 1、声明基本变量

在 **Node** 类中，我们需要声明所需的基本变量 `int value;` 表示结点中所存储的值、`Node left;` 、 `Node right;` 二叉排序树的左子结点和右子结点，以及 **toString** 方法用于打印输出相关结点的信息。

**代码实现如下：**

```java
// 创建Node结点
class Node {
    int value;
    Node left;
    Node right;

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

在 **BinarySortTree** 这个类中，定义一个 `Node root` 用于完成后续各种方法体中的使用， *可以理解成根结点* 。以及返回root结点的方法。

**代码实现如下：**

```java

class BinarySortTree {
    private Node root;

    public Node getRoot() {
        return root;
    }
}
```

#### 2、添加结点方法

*在Node类中，完成对于添加结点方法的编写。*

在这里以递归的形式添加结点。首先我们通过方法体传入一个需要添加的结点 **node** 。然后判断该结点是否为空，如果为空，则无法添加直接返回即可。

根据二叉排序树的性质，可知，如果传入的结点的值小于当前子树的根结点的值`node.value < this.value`   ，放到左子树，否则放到右子树。但是如何放置呢？这里以左子树举例，（右子同理）如果当前子树的左子结点为空`this.left == null`，直接把当前结点添加到左子树就好`this.keft = node;`；否则的话，递归的向左子树添加结点 `this.left.add(node);` 

**Node类中代码实现如下：**

```java

    // 添加结点的方法，以递归的形式添加结点
    public void add(Node node) {
        if (node == null) {
            return;
        }

        // 判断传入结点的值，和当前子树的根结点的值的关系
        if (node.value < this.value) {
            // 如果当前结点的左子结点为null
            if (this.left == null) {
                this.left = node;
            } else {
                // 递归的向左子树添加
                this.left.add(node);
            }
        } else {// 添加的结点的值大于当前结点的值
            if (this.right == null) {
                this.right = node;
            } else {
                // 递归的向右子树添加结点
                this.right.add(node);
            }
        }
    }
```

好了，到此为止，在Node类中完成了对于添加结点的方法操作，现在直接在BinarySortTree中封装一下，就可以使用了。

还是一样，先传入一个结点node，然后判断需要添加子树的根结点是否是为空`root == null`，如果为空，直接让root指向node即可，`root = node;` 若不为空，直接调用Node类中的添加结点的方法即可。`root.add(node);`

**BinarySortTree类中代码实现如下：**

```java
    // 添加结点的方法
    public void add(Node node) {
        if (root == null) {
            root = node;// 如果root为空，则直接让root指向node
        } else {
            root.add(node);
        }
    }
```

#### 3、中序遍历

在完成添加结点的方法之后，也就是创建二叉排序树，下面我们来使用中序遍历，完成对其的输出。

说到中序遍历，想必大家已经都非常熟悉，所以也就没什么好说的了，输出顺序为：**左子结点、根结点、右子结点** 。所以我们按照这个顺序使用递归的方式完成即可，输出结点信息之前，需要先确认当前结点是否为空，如果不为空则开始递归遍历。

**Node类中代码实现如下：**

```java
    // 中序遍历
    public void infixOrder() {
        if (this.left != null) {
            this.left.infixOrder();
        }
        System.out.println(this);
        if (this.right != null) {
            this.right.infixOrder();
        }
    }
```

在 **BinarySortTree** 类中，封装一下中序遍历方法。如果根结点不为空 `root != null` ，则开始遍历 `root.infixOrder();` ，如果为空，则给出相对应的信息即可。

**BinarySortTree类中代码实现如下：**

```java
    // 中序遍历
    public void infixOrder() {
        if (root != null) {
            root.infixOrder();
        } else {
            System.out.println("二叉排序树为空，不能遍历~~~");
        }
    }
```

#### 4、查找要删除结点的结点及其父结点

在这里，我们要根据所给的需要删除结点的值 `value`，分别完成找到需要删除的结点以及其父结点的操作。

##### ①查找需要删除的结点

如果 `value == this.value` ，巧了，刚好找到，就是当前结点，执行 `return this;` 如果查找的值小于当前结点的值 `value < this.value` ，向左子树递归查找，如果左子树为空 `this.left == null` ，`return null;` 否则，递归的向左子树查找 `return this.left.search(value);` 如果查找的值不小于当前结点的值，向右子树递归查找，具体操作与左子树相同，这里不做过多的赘述，直接上代码。

**Node类中代码实现如下：**

```java

    /**
     * 查找需要删除的结点
     *
     * @param value 需要删除的结点的值
     * @return 如果找到就返回该结点，否则返回null
     */
    public Node search(int value) {
        if (value == this.value) {// 找到，就是当前结点
            return this;
        } else if (value < this.value) {// 如果查找的值小于当前结点的值，向左子树递归查找
            // 如果左子树为空
            if (this.left == null) {
                return null;
            }
            return this.left.search(value);
        } else {// 如果查找的值不小于当前结点的值，向右子树递归查找
            // 如果右子树为空
            if (this.right == null) {
                return null;
            }
            return this.right.search(value);
        }
    }
```

在Node类中完成了对于查找要删除结点的方法操作，现在直接在BinarySortTree中封装一下，就可以使用了。

先传入一个结点的值value，然后判断根结点是否是为空`root == null`，如果为空，直接返回null，`return null;` 若不为空，直接调用Node类中的查找删除结点的方法即可。`return root.search(value);`

##### ②查找要删除结点的父结点

接下来，我们完成一下对于 查找要删除结点的父结点的操作。还是和上面一样，先传入一个需要查找结点的值`value` ，返回的是需要删除结点的父结点，如果没有就返回null。

如果当前结点就是需要删除结点的父结点`(this.left != null && this.left.value == value) || (this.right != null && this.right.value == value)`，直接返回即可 `return this;` 否则的话，根据二叉排序树的特点，完成以下操作：如果要查找的值小于当前结点的值，并且当前结点的左子结点不为空 `value < this.value && this.left != null`，开始递归向左子树进行查找 `return this.left.searchParent(value);` 如果要查找的值大于等于当前的值，并且当前结点的右子结点不为空 `value >= this.value && this.right != null`，开始递归的向右子树查找 `eturn this.right.searchParent(value);` 如果进行上述两种操作之后，还是没找到的话，那么直接 `return null;`

**Node类中代码实现如下：**

```java
    /**
     * 查找要删除结点的父结点
     *
     * @param value 需要查找结点的值
     * @return 返回的是需要删除结点的父结点，如果没有就返回null
     */
    public Node searchParent(int value) {
        // 如果当前结点就是需要删除的结点的父结点，直接返回即可
        if ((this.left != null && this.left.value == value) || (this.right != null && this.right.value == value)) {
            return this;
        } else {
            // 如果要查找的值小于当前结点的值，并且当前结点的左子结点不为空
            if (value < this.value && this.left != null) {
                return this.left.searchParent(value);
            } else if (value >= this.value && this.right != null) {
                return this.right.searchParent(value);
            } else {
                return null;// 没有找到父结点
            }
        }
    }
```

在Node类中完成了对于查找要删除结点的父结点方法的操作，现在直接在BinarySortTree中封装一下，就可以使用了。

老规矩，先传入一个结点的值value，然后判断根结点是否是为空`root == null`，如果为空，直接返回null，`return null;` 若不为空，直接调用Node类中的查找删除结点的方法即可。`return root.searchParent(value);`

**BinarySortTree类中代码实现如下：**

```java
    // 查找父结点
    public Node searchParent(int value) {
        if (root == null) {
            return null;
        } else {
            return root.searchParent(value);
        }
    }
```



#### 5、删除结点

俗话说 “请神容易送神难“ ，这不，正应了这句话。对于二叉排序树的删除，就不是那么容易了，我们不能因为删除了某个结点，就让这棵树变得不满足二叉排序树的特性，所以删除需要考虑多种情况。

主要有以下三种情况：

-    删除 **叶子节点** （比如：2,5,9,12）
-    删除 **只有一颗子树的结点** （比如：1）
-    删除 **有两棵子树的结点** （比如：7,3,10）

下面我们就对于以上的情况，进行具体的操作分析：

##### ①准备工作

在删除一个结点之前，我们需要保证删除的结点是有效的，然后再执行具体的删除方法。

如果 `root == null` 也就是说，root为空，则直接 return即可。如果不为空，开始执行以下的操作：

-    1.需要先找到要删除的结点 targetNode `Node targetNode = search(value);`
     -    如果没有找到要删除的结点 `targetNode == null` ,则直接return
-    2.如果当前的这棵二叉排序树只有一个结点，直接置空；
-    3.去找到TargetNode的父结点 `Node parent = searchParent(value);`

**BinarySortTree类中代码实现如下：**

（这里我们直接把删除方法放在BinarySortTree类中完成）

```java
        if (root == null) {
            return;
        } else {
            // 1、需要先找到要删除的结点 targetNode
            Node targetNode = search(value);
            // 如果没有找到要删除的结点
            if (targetNode == null) {
                return;
            }
            // 2、如果当前这颗二叉排序树只有一个结点
            if (root.left == null && root.right == null) {
                root = null;
                return;
            }
            // 3 、去找到targetNode的父结点
            Node parent = searchParent(value);
        }
```



##### ②删除叶子结点

对于要删除结点是叶子结点的情况，相对而言是比较容易的。因为是叶子结点，所以它没有左右子树，所以直接把它抹了即可。但是呢，它本身是无法完成删除操作的，需要先去找到要删除的结点 `targetNode` ,然后再去找到 `targetNode` 的父结点 `parent` ，接下就是需要确定 targetNode 是 parent的左子结点，还是右子结点，根据对应的情况进行删除即可。

-    如果是左子结点，将父结点的左子树置空，即 `parent.left == null`
-    如果是右子结点，将父结点的右子树置空，即 `parent.right == null` 

**BinarySortTree类中代码实现如下：**

```java
            // 4、如果要删除的节点是叶子结点
            if (targetNode.left == null && targetNode.right == null) {
                // 判断targetNode是父结点的左子结点还是右子结点
                if (parent.left != null && parent.left.value == value) {// 是左子结点
                    parent.left = null;
                } else if (parent.right != null && parent.right.value == value) {// 是右子结点
                    parent.right = null;
                }
            }
```

##### ③删除两棵子树的结点

为什么我们先说删除有两棵子树的结点呢？？那么因为语言描述只有一棵子树的结点，相比而言是要难一点的，所以直接把这种情况放在最后，用一个 **else** 来概括即可。

删除是有两棵子树的结点 `targetNode.left != null && targetNode.right != null` ,因为它有两棵子树，那么它一旦被删除了，是谁来接班呢？？就好比如何选取一个合适的人选来继承家产呢，并且还满足二叉排序的特点。这样一来，问题也就随之而来了，该如何选出这个合适的继承人呢？？

假设现在需要删除的结点是7，也就是该二叉排序树的根结点，现在仔细观察一下里面的元素，是否可以从其左右子树中找到适合的结点呢？？果然，5或9都可以代替7，此时删除7后，整个二叉排序树的结构并没有发生本质的改变。

思考一下，为什么选择5或9这两个结点呢？？对的，它们刚好是二叉排序树中比它小或比它大的最接近7的两个数。也就是说，我们对当前这棵而排序树进行中序遍历，`1, 2, 3, 5, 7, 9, 10, 12`，它们刚好是7的前驱和后继。所以说现在的问题转化为如何知道需要删除结点的前驱结点或者后继结点。根据二叉排序树的特点，以需要删除的结点为根结点，那么它的右子树中最小的结点或者左子树中最大的结点，就是可以删除它后，从而代替它的结点。

这里以右子树最小的结点为例，编写一个具体的方法来进行讲解。某颗子树最小的结点一定是左子树的最后一个结点，所以直接循环地查找左子结点，就会找到最小的值。找到最小的这个结点之后，先别激动，需要把它给删除，因为它即将代替需要删除的结点，再找个临时变量来保存它，这里我们先直接返回它，在具体的删除方法中再取出即可。

**BinarySortTree类中代码实现如下：**

```java
    /**
     * 编写方法：
     * 1、返回的是以node为根结点的二叉排序树的最小结点的值
     * 2、删除node为根结点的二叉排序树的最小结点
     *
     * @param node 传入的结点（当做二叉排序树的根结点）
     * @return 返回的 以node为根结点的二叉排序树的最小结点的值
     */
    public int delRightTreeMin(Node node) {
        Node target = node;
        // 循环的查找左子结点，就会找到最小的值
        while (target.left != null) {
            target = target.left;
        }
        // 这时target就指向了最小结点
        // 删除最小结点
        delNode(target.value);
        return target.value;
    }
```

哈哈哈哈，找到了继承人，接下来的工作，相对而言就要简单的多了，先找一个临时变量`minVal` 来保存从`delRightTreeMin(targetNode.right)` 返回的值，然后再把这个值重新赋值给需要删除的结点即可。

**BinarySortTree类中代码实现如下：**

```java
             else if (targetNode.left != null && targetNode.right != null) {// 删除的是有两棵子树的结点
                int minVal = delRightTreeMin(targetNode.right);
                targetNode.value = minVal;
            }
```

##### ④删除只有一颗子树的结点

对于要删除的结点只有左子树或只有右子树的情况，相对也是比较容易解决的。那就是结点删除后，将它的左子树或右子树整个移动到删除结点的位置即可，说直白点，可以理解为独自继承父业呗，哈哈哈哈。下面我们来看下具体的实现方法：

既然是要删除它，那么毫无疑问，得先找到要删除的结点 `targetNode`，再接着找到其父结点 `parent`，然后 *接下来的内容可能会有点绕，会有点傻傻的左右分不清，可以自己画图来尝试理解* ，确定targetNode的子结点是左子结点还是右子结点，以及 需要删除对的结点 targetNode 是其父结点 parent的左子结点还是右子结点。分成如下操作：

-    如果需要删除结点的左子树不为空 `targetNode.left != null` （并且 `parent != null`）

     -    如果targetNode是parent的左子结点 `parent.left.value == targetNode.value`
         -   将其父结点的左索引指向其左子结点 `parent.left = targetNode.left;`
     -   否则targetNode是parent的右子结点 
          -   将其父结点的右索引指向其左子结点 `parent.right = targetNode.left;`
-    否则（如果parent为空），直接 `root == targetNode.left;`即可。
-    如果需要删除结点的右子树不为空（并且 `parent != null`）
     -    如果targetNode是parent的左子结点 `parent.left.value == targetNode.value`
          -   将其父结点的左索引指向其右子结点 `parent.left = targetNode.right;`
     -    否则targetNode是parent的右子结点 
          -   将其父结点的右索引指向其右子结点 `parent.right = targetNode.right;`
-    否则（如果parent为空），直接 `root == targetNode.right;`即可。

**BinarySortTree类中代码实现如下：**

```java
             else {// 删除只有一颗子树的结点
                // 如果要删除的节点有左子结点
                if (targetNode.left != null) {
                    if (parent != null) {
                        // 如果targetNode是parent的左子结点
                        if (parent.left.value == targetNode.value) {
                            parent.left = targetNode.left;
                        } else {//targetNode是parent的右子结点
                            parent.right = targetNode.left;
                        }
                    } else {
                        root = targetNode.left;
                    }
                } else {// 如果需要删除的结点有右子结点
                    if (parent != null) {
                        // 如果targetNode是parent的左子结点
                        if (parent.left.value == targetNode.value) {
                            parent.left = targetNode.right;
                        } else {// 如果targetNode是parent的右子结点
                            parent.right = targetNode.right;
                        }
                    } else {
                        root = targetNode.right;
                    }
                }
            }
```

到此为止，我们完成了对于一个结点的删除工作，由此可见是相当的麻烦啊！！！

---

## 三、结束语

该死的二叉排序树终于写完了，十一月份只写了一半，忙（懒）成狗。。。。

二叉排序树是链接的方式存储，保持了链接存储结构在执行插入或删除操作时不用移动元素的优点。只要找到合适的插入和删除位置后，仅需修改链接指针即可。对于查找而言，走的就是从根结点到要查找结点的路径，其比较次数等于给定值的结点在二叉排序树的层数。因为篇幅优先，查找算法可以结合之前所更新的博客自行完成即可。

源码地址 ——> [二叉排序树](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/binarysorttree/BinarySortTreeDemo.java)