---
title: "数据结构--单向链表"
date: 2020-05-30T16:23:52+08:00
---

# 单向链表

## 一、基本介绍

### 1、相关定义

链表实际上是线性表的链式存储结构，与数组不同的是，它是用一组任意的存储单元来存储线性表中的数据，存储单元不一定是连续的，且链表的长度不是固定的。链表的每个元素称为一个结点，每个结点都可以存储在内存中的不同的位置，为了表示每个元素与后继元素的逻辑关系，以便构成“一个结点链着一个结点”的链式存储结构，为了保持每个结点之间的链接，所以链表除了存储元素本身的信息外，还要存储其直接后继信息，因此，每个结点都包含两个部分，第一部分用于存储元素本身的数据信息，称为**数据域**，它不局限于一个成员数据，也可是多个成员数据；第二部分是一个结构体指针，称为链表的**指针域**，用于存储其直接后继的结点信息，这里用next表示，next的值实际上就是**下一个结点的地址**，当前结点为末结点时，next的值设为空指针，即为null。链表在使用过程中，可以根据实际需求来判断是否需要添加头结点。

### 2、链表与数组比较

数组（包括结构体数组）的实质是一种线性表的顺序表示方式，它的优点是使用直观，便于快速、随机地存取线性表中的任一元素，但缺点是对其进行插入和删除操作时需要移动大量的数组元素，同时由于数组属于静态内存分配，定义数组时必须指定数组的长度，程序一旦运行，其长度就不能再改变，实际使用个数不能超过数组元素最大长度的限制，否则就会发生下标越界的错误，低于最大长度时又会造成系统资源的浪费，因此空间效率差。

---

## 二、算法实现

我们需要定义一个类用来存放结点信息，同时也还需要定义一个类用于管理结点，实现单链表的增删改查。



### 1、定义一个HeroNode类表示结点

我们需要在HeroNode类中实现相关变量的定义、赋值以及显示信息的方法。

#### ① 相关变量

这里我们使用单链表来存储水浒英雄，需要存储的信息有：编号、姓名和昵称。还需要定义一个next域用于指向下一个结点。

**代码实现如下：**

```java
    public int no;// 编号
    public String name;// 姓名
    public String nickname;// 昵称
    public HeroNode next;// next域，指向下一个节点
```

#### ②构造器

可以利用构造器对相关变量进行赋值。

**代买实现如下：**

```java
    public HeroNode(int no, String name, String nickname) {
        this.no = no;
        this.name = name;
        this.nickname = nickname;
    }
```

#### ③显示链表信息

我们可以使用toString方法来显示链表的信息。

**代码实现如下：**

```java
    // 利用toString显示信息
    @Override
    public String toString() {
        return "HeroNode{" +
                "no='" + no + '\'' +
                ", name='" + name + '\'' +
                ", nickname=" + nickname +
                '}';
    }
```



### 2、定义一个SingleLinkedList类管理结点

我们需要在这个类中完成对于链表的增删改查。在进行相关操作之前，需要先定义一个头结点，不存放具体的数据，仅指向第一个结点。

**代码实现如下：**

````java
    //先初始化一个头节点，头节点不要动，不存放具体的数据
    private HeroNode head = new HeroNode(0, "", "");
````

#### ①直接添加数据到单链表

直接添加数据到队列尾，即不考虑编号按照添加顺序，入链表。因为头结点不能动，所以需要定义一个临时变量temp用于遍历。通过后移temp实现遍历，**temp = temp.next** 。遍历的目的在于，找到当前链表最后的结点，然后将最后这个结点的next指向新的结点，便完成了添加的操作。

**代码实现如下：**

```java
    public void add(HeroNode heroNode) {
        //因为head节点不能动，因此我们需要一个辅助变量temp
        HeroNode temp = head;
        //遍历链表，找到最后
        while (true) {
            //找到链表的最后
            if (temp.next == null) {
                break;
            }
            //如果没有找到最后，将temp后移
            temp = temp.next;
        }
        //当退出while循环时，temp指向了链表的最后
        //将最后这个节点的next指向新的节点
        temp.next = heroNode;
    }
```



#### ②根据编号添加结点

这次我们使用按照编号顺序添加结点，如果该编号已经存在，则添加失败，并给出提示。按照编号添加结点，使用的方法是通过 **后移temp** 遍历，找到该编号的前一个结点，然后让需要添加的结点先指向前一个结点的下一个结点，然后再让前一个结点指向需要添加的结点。所以需要一个flag变量来标记是否找到当前结点。

**代码实现如下：**

```java
    public void addByOrder(HeroNode heroNode) {
        //因为头节点不能动，因此仍然需要通过一个辅助指针（变量）来帮助找到添加的位置
        //因此我们找的temp是位于添加位置的前一个节点，否则插入不了
        HeroNode temp = head;
        boolean flag = false;//标志添加的编号是否存在，默认为false
        while (true) {
            if (temp.next == null) {//说明temp已经在链表的最后
                break;
            }
            if (temp.next.no >= heroNode.no) {//位置找到，就在temp的后面插入
                break;
            } else if (temp.next.no == heroNode.no) {//说明希望添加的heroNode编号已经存在
                flag = true;//说明编号存在
                break;
            }
            temp = temp.next;//后移，遍历当前链表
        }
        //判断flag的值
        if (flag) {//不能添加，说明编号已经存在
            System.out.printf("准备插入的英雄编号%d已经存在，添加失败\n", heroNode.no);
        } else {
            //插入到链表中，temp的后面
            heroNode.next = temp.next;
            temp.next = heroNode;
        }
    }
```



#### ③修改结点信息

这里我们通过根据编号来修改结点信息，即编号不能改。同时需要传入一个新的结点 **newHeroNode** ，用于存储修改结点的信息。在进行修改之前，需要先判断单链表是否为空，**head.next == null** 链表为空。然后定义一个辅助变量temp和flag分别用于遍历和标记是否找到当前结点。如果 **temp.no == newHeroNode.no** 表示找到当前需要修改的结点。赋予新的name和nickname完成修改结点的操作。

**代码实现如下：**

```java
    //1、根据newHeroNode的no来修改即可
    public void update(HeroNode newHeroNode) {
        //判断是否为空
        if (head.next == null) {
            System.out.println("链表为空");
            return;
        }
        //2、找到需要修改的节点，根据num编号修改
        HeroNode temp = head.next;//定义一个辅助变量
        boolean flag = false;//表示是否找到该节点
        while (true) {
            if (temp == null) {
                break;//已经遍历结束
            }
            if (temp.no == newHeroNode.no) {//找到
                flag = true;
                break;
            }
            temp = temp.next;
        }
        //3、根据flag，判断是否找到需要修改的节点
        if (flag) {
            temp.name = newHeroNode.name;
            temp.nickname = newHeroNode.nickname;
        } else {//没有找到
            System.out.printf("没有找到编号%d的节点，不能修改\n", newHeroNode.no);
        }
    }
```



#### ④删除结点

在进行删除结点的操作的时候，我们仍然根据编号来进行寻找需要删除的结点。找到需要删除结点的前一个结点，让前一个结点的next跨过需要删除的结点，直接指向下一个结点，即 **temp.netx = temp.next.next** ，完成删除。在进行删除之前仍然需要定义temp和flag用于遍历和标记是否找到需要删除结点的前一个结点。

**代码实现如下：**

```java
    public void del(int no) {
        HeroNode temp = head;
        boolean flag = false;//标志是否找到待删除节点
        while (true) {
            if (temp.next == null) {
                break;//已经到链表的最后
            }
            if (temp.next.no == no) {//找到待删除节点的前一个节点temp
                flag = true;
                break;
            }
            temp = temp.next;//temp后移，遍历
        }
        //判断flag
        if (flag) {//找到
            //可以删除
            temp.next = temp.next.next;
        } else {
            System.out.printf("需要删除的%d节点不存在\n", no);
        }
    }
```



#### ⑤显示链表信息

在显示链表信息之前，需要先判断链表是否为空，并给出相关信息。通过后移临时变量temp完成遍历。先输出结点信息，每当输出一个结点信息，就需要后移一次。

**代码实现如下：**

```java
    //显示链表，遍历
    public void show() {
        //判断链表是否为空
        if (head.next == null) {
            System.out.println("链表为空");
            return;
        }
        //因为头节点不能动，因此我们需要一个辅助变量来遍历
        HeroNode temp = head.next;
        while (temp != null) {// 判断是否到链表最后
            //输出节点的信息
            System.out.println(temp);
            //将temp后移
            temp = temp.next;
        }
    }
```

---

## 三、结束语

到此，我们了解了有关单链表的相关操作。在算法实现过程中，可能不少小朋友会发现一些问题，比如为什么有时候临时变量 **temp = head.next** ， 而有时却变成了**temp = head** 了呢？？其实仔细阅读一遍代码，我们不难发现，当进行增删操作的时候，**temp = head** ，那是因为需要增删的结点刚好是直接添加到头结点之后的，如果变成了 **head.next** ， 则会造成覆盖结点的情况；而在进行修改和遍历的时候，临时变量 **temp = head.next** ，那是因为我们这里定义头结点为空，不存放任何数据，所以修改和遍历的时候，需要从真正的有效结点开始。

源码已经push到 ——>[数据结构](https://github.com/QuakeWang/DataStructes)