---
title: "数据结构——约瑟夫环"
date: 2020-06-14T11:03:36+08:00
draft: true
---

# 环形链表

---

## 一、基本介绍

## 1、问题来历

据说著名犹太历史学家Josephus有过以下的故事：在罗马人占领乔塔帕特后，39  个犹太人与Josephus及他的朋友躲到一个洞中，39个犹太人决定宁愿死也不要被敌人抓到，于是决定了一个自杀方式，41个人排成一个圆圈，由第1个人开始报数，每报数到第3人该人就必须自杀，然后再由下一个重新报数，直到所有人都自杀身亡为止。然而Josephus 和他的朋友并不想遵从。首先从一个人开始，越过k-2个人（因为第一个人已经被越过），并杀掉第*k*个人。接着，再越过k-1个人，并杀掉第*k*个人。这个过程沿着圆圈一直进行，直到最终只剩下一个人留下，这个人就可以继续活着。问题是，给定了和，一开始要站在什么地方才能避免被处决？Josephus要他的朋友先假装遵从，他将朋友与自己安排在第16个与第31个位置，于是逃过了这场死亡游戏。

## 2、问题简化

在了解了约瑟夫环的来历之后，我们对该问题进行以下简化。其实我们联系一下，将会发现约瑟夫环是不是和我们小时候玩的丢手帕有些类似呢？

那么我们首先假设有五个小孩围城一个圈，然后从第一个小孩开始报数，每次数到2，则这个小孩出圈，以此类推，通过简单地推理我们可以得出，出队列的顺序是：2—>4—>1—>5—>3.

在了解了有关约瑟夫环的介绍之后，我们可以使用单向环形链表来对它进行相关操作。这里我们使用的是没有头结点的链表。

---

## 二、算法描述

### 1、定义结点

定义一个结点，存放小孩的编号。在之前介绍链表的时候，我们定义变量的属性都是共有的，这里我们尝试一下私有的，因此需要使用到**get**和**set**方法，来进行赋值和获取相关变量。同时，还需要一个**构造器**，分别用于*传入结点的编号*。

**代码实现如下：**

```java
// 创建一个Boy类，表示一个结点
class Boy {
    private int no;// 编号
    private Boy next;// 指向下一个结点，默认为null

    // 构造器
    public Boy(int no) {
        this.no = no;
    }

    public int getNo() {
        return no;
    }

    public Boy getNext() {
        return next;
    }

    public void setNo(int no) {
        this.no = no;
    }

    public void setNext(Boy next) {
        this.next = next;
    }
}
```

### 2、定义一个类用于管理结点

首先需要创建一个first结点，不存放任何数据，也就是当前没有编号的结点。

**代码实现如下：**

```java
    // 创建一个first结点，当前没有编号
    private Boy first = null;
```

#### ①添加结点入链表

首先传入一个**nums**表示需要添加结点的个数。在进行添加之前，还需要判断传入的nums是否符合要求。然后定义一个**curBoy**辅助指针，帮助构建环形链表。

我们通过for循环创建结点，先创建第一个结点，让first结点指向该结点，然后first的next域指向自己，构成一个*环*，最后再让辅助指针curBoy指向first，即完成第一个结点的添加操作；添加其它结点的方法如下：先让curBoy的下一个结点指向需要添加的结点（通过setNext方法），然后再让该结点的next域指向first结点，形成环，最后使curBoy指向当前添加的结点（为了方便下一次添加结点），从而完成添加结点的相关操作。

**代码实现如下：**

```java
    // 添加小孩结点，构建一个环形的链表，nums表示需要添加结点的个数
    public void addBoy(int nums) {
        if (nums < 1) {//检验
            System.out.println("nums的值不正确");
            return;
        }
        Boy curBoy = null;// 辅助指针，帮助构建环形链表
        // 使用for循环俩创建环形链表
        for (int i = 1; i <= nums; i++) {
            // 根据编号，创建小孩结点
            Boy boy = new Boy(i);
            // 如果是第一个小孩
            if (i == 1) {
                first = boy;
                first.setNext(first);// 构成环
                curBoy = first;
            } else {
                curBoy.setNext(boy);
                boy.setNext(first);
                curBoy = boy;
            }
        }
    }
```

#### ②遍历输出环形链表

首先判断链表是否为空，即**if(first == null)**，如果为空则给出提示；不为空则执行以下操作：因为first结点不能动，因此需要一个辅助变量用于完成遍历，即 **Boy curBoy = first**，然后我们使用while来进行循环遍历。通过getNext方法实现后移，如果curBoy的下一个结点为first则遍历结束，退出循环。完成链表的遍历。

**代码实现如下：**

```java
    // 遍历当前的环形链表
    public void showBoy() {
        // 判断链表是否为空
        if (first == null) {
            System.out.println("该环形链表为空~");
            return;
        }
        // 因为first不能动，因此需要一个辅助指针完成遍历
        Boy curBoy = first;
        while (true) {
            System.out.printf("小孩的编号%d\n", curBoy.getNo());
            if (curBoy.getNext() == first) {// 说明已经遍历完毕
                break;
            }
            curBoy = curBoy.getNext();// curBoy后移
        }
    }
```

#### ③完成结点出链表

我们需要传入几个参数，**startNo**表设从第几个结点开始报数，**countNum**表示需要数几下，**nums**表示圈中有多少个小孩。

首先需要对数据进行一个校验，即判断环形链表是否为空，开始报数的位置不能低于1，也不能大于圈中的结点。

**代码实现如下：**

```java
        if (first == null || startNo < 1 || startNo > nums) {
            System.out.println("参数输入有误，请重新输入~");
            return;
        }
```

然后需要创建一个辅助指针**helper**，帮助完成小孩出圈。接下来我们需要将helper先指向链表的最后这个结点，即helper的下一个结点就是first结点。紧接着通过while循环，我们再将first和helper指针同时移动**countNum - 1**次，到达需要出圈结点的位置。

最后也是最关键的一步，完成小孩结点出圈。先让first结点指向它的下一个结点，即**first = first.getNext();**，然后再将helper的下一个结点设置为当前first所指向的结点，即**helper = helper.setNext(first);**，这样first原来所指向的结点没有任何引用，就会被回收。

如果**helper == first**,则说明圈中只有一个结点。输出这个结点的信息，就完成了出圈的操作。

```java
    /**
     * 根据用户的输入，计算出小孩出圈的顺序
     *
     * @param startNo  表示从第几个小孩开始数数
     * @param countNum 表示数几下
     * @param nums     表示最初有多少个小孩在圈中
     */
    public void countNum(int startNo, int countNum, int nums) {
        // 先对数据进行校验
        if (first == null || startNo < 1 || startNo > nums) {
            System.out.println("参数输入有误，请重新输入~");
            return;
        }
        // 创建一个辅助指针，帮组完成小孩出圈
        Boy helper = first;
        //需要创建一个辅助指针（变量）helper，事先应该指向环形链表的最后这结点
        while (true) {
            if (helper.getNext() == first) {// 说明helper指向最后小孩结点
                break;
            }
            helper = helper.getNext();
        }
        // 当小孩报数前，先让first和helper指针同时移动 startNo - 1 次，到达需要报数的位置
        for (int j = 0; j < startNo - 1; j++) {
            first = first.getNext();
            helper = helper.getNext();
        }
        // 当小孩报数时，让first和helper指针同时移动countNum - 1次，然后出圈
        // 这里使用循环操作，直到圈中只有一个结点
        while (true) {
            if (helper == first) {// 说明圈中只有一个结点
                break;
            }
            // 让first和helper指针同时移动countNum - 1次
            for (int j = 0; j < countNum - 1; j++) {
                first = first.getNext();
                helper = helper.getNext();
            }
            // 这时first指向的结点，就是要出圈的小孩结点
            System.out.printf("小孩%d出圈\n",first.getNo());
            first = first.getNext();
            helper.setNext(first);
        }
        System.out.printf("最后留在圈中的小孩编号%d\n",first.getNo());
    }
```

---

## 三、结束语

在此，更新了环形链表，关于链表的所有基础知识也就要告一段落咯。谈谈我一开始学习链表的感觉吧，从一个小白，刚开始接触数据结构，就被其中各种复杂的结构所惊讶到。特别在学习到链表的时候，更加感觉到举步维艰，似乎很玄学，说不懂，但其实还是有一点点明白大概的结构。但是距离能够独立写出一个链表的结构还有很长一段路要走。因此我查阅了一些相关博客，只看代码和文字描述，总感觉少了点什么，写得再好的代码和文字，倒不如一张图来得实在，所以在学习的时候，我建议可以结合画图来实际操作，这样更方便理解，还有利于记忆。

环形链表源码—> [数据结构](https://github.com/QuakeWang/DataStructes/blob/master/src/com/quake/linkedlist/Josephus.java)

