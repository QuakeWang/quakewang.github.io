---
title: "数据结构——双向链表"
date: 2020-06-06T14:48:57+08:00
draft: true
---

# 双向链表

---

## 一、基本介绍

在上一篇博客中，我们提到了单链表，它只有一个next指针，指向下一个结点，所以我们要查找下一个结点是很容易做到的，但是要想查找上一个结点就复杂的多了。因此有了**双向链表**。

**双向链表**有两个指针域，除了有next域指向下一个结点之外，还有pre域指向上一个结点。这样使得双链表可以双向遍历。节省了时间成本，但相比于单链表插入数据和删除数据就相对复杂一些。下面我们对双链表进行简单学习一下吧。

---

## 二、算法实现

双链表和单链表一样，需要创建一个类用于存放结点信息，再创建一个类用于管理结点，对双链表进行相关的操作。

### 1、定义节点类

我们需要在HeroNode2类中实现相关变量的定义、赋值以及显示信息的方法。

#### ①相关变量

这里我们使用双链表存储水浒英雄，和单链表相同，还得增加一个pre指针，指向前一个结点。

**代码实现如下：**

```java
    public int no;
    public String name;
    public String nickname;
    public HeroNode2 pre;// 指向下一个结点，默认为null
    public HeroNode2 next;// 指向前一个结点，默认为null
```



#### ②构造器

利用构造器，对相关变量进行赋值。

**代码实现如下：**

```java
    public HeroNode2(int no, String name, String nickname) {
        this.no = no;
        this.name = name;
        this.nickname = nickname;
    }
```



#### ③显示链表信息

这里利用toString方法，返回链表的信息。

```java
    // 为了显示方法，重写toString
    @Override
    public String toString() {
        return "HeroNode2{" +
                "no='" + no + '\'' +
                ", name='" + name + '\'' +
                ", nickname=" + nickname +
                '}';
    }
```

---

### 2、定义一个DoubleLinkedList类管理结点

我们需要在这个类中完成对于链表的增删改查。在进行相关操作之前，同样需要先定义一个头结点，不存放具体的数据，仅指向第一个结点。

**代码实现如下：**

```java
    // 先初始化一个结点，头结点不要动，不存放具体的数据
    private HeroNode2 head = new HeroNode2(0, "", "");
```



#### ①添加数据到队列尾

与单链表相同，需要先定义一个辅助变量temp，利用while循环遍历到链表的最后。当退出while循环时，即temp指向了链表的最后。这时我们需要将temp的next域指向需要添加的结点，然后再将需要添加的结点的pre域指向temp，完成添加。

**代码实现如下：**

```java
    // 添加一个结点到双向链表的最后
    public void add(HeroNode2 heroNode2) {
        // 因为head结点不能动，因此我们需要添加一个辅助变量temp
        HeroNode2 temp = head;
        // 遍历链表，知=找到链表的最后
        while (true) {
            if (temp.next == null) {// 遍历到链表的最后
                break;
            }
            // 如果没有找到将temp后移
            temp = temp.next;// 后移
        }
        // 当退出while循环时，temp就指向了链表的最后
        // 形成了一个双向链表
        temp.next = heroNode2;
        heroNode2.pre = temp;
    }
```



#### ②根据编号顺序添加结点

与单链表相同，需要先找到需要添加结点(heroNode2)的前一个结点（temp），这里不做过多赘述。当找到需要添加的结点的前一个结点之后，需要进行如下操作：

需要先将heroNode2完成拼接，即先将heroNode2的next域指向temp.next;（新插入节点的前一个结点指向它的下一个结点），再将heroNode的pre域指向temp（将新插入的结点指向它的前一个结点），这时heroNode的pre域和next域已经分别指向了heroNode的前驱结点和后继结点；剩余需要做的就是让heroNode的前驱结点的next域和后继结点的pre域指向heroNode，但需要注意的是：如果添加的位置刚好是最后一个结点，则heroNode没有后继结点，也就是不用执行**temp.next.pre = heroNode2**。

**代码实现如下：**

```java
    // 根据编号顺序添加结点
    public void addByOrder(HeroNode2 heroNode2) {
        HeroNode2 temp = head;
        boolean flag = false;
        while (true) {
            if (temp.next == null) {
                break;
            }
            if (temp.next.no > heroNode2.no) {
                break;
            } else if (temp.next.no == heroNode2.no) {
                flag = true;
                break;
            }
            temp = temp.next;
        }
        if (flag) {
            System.out.printf("需要插入的英雄编号%d已存在，添加失败\n", heroNode2.no);
        } else {
            heroNode2.next = temp.next;// 将新插入的结点指向它的下一个结点
            heroNode2.pre = temp;// 将新插入的结点指向它的前一个结点
            // 注：如果不是最后一个结点，则不需要执行下面这块代码，否则会出现空指针
            if (temp.next != null) {
                temp.next.pre = heroNode2;
            }
            temp.next = heroNode2;
        }
    }
```



#### ③修改结点信息

修改结点信息的方法和单链表如出一辙，通过遍历找到需要修改结点所在的位置即可。

**代码实现如下：**

```java
    // 修改结点信息（可以看待双向链表的结点内容修改和单向链表一样）
    public void update(HeroNode2 newHeroNode2) {
        // 判断链表是否为空
        if (head.next == null) {
            System.out.println("链表为空~");
            return;
        }
        // 找到需要修改的结点，根据no编号
        HeroNode2 temp = head.next;// 定义一个辅助变量
        boolean flag = false;
        while (true) {
            if (temp == null) {
                break;
            }
            if (temp.no == newHeroNode2.no) {// 找到
                flag = true;
                break;
            }
            temp = temp.next;
        }
        //根据flag判断是否找到需要修改的节点
        if (flag) {
            temp.name = newHeroNode2.name;
            temp.nickname = newHeroNode2.nickname;
        } else {//没有找到
            System.out.printf("没有找到 编号%d的节点，不能修改", newHeroNode2.no);
        }
    }
```



#### ④删除结点

从双向链表中删除一个结点，我们只需直接找到需要删除的结点，找到后，双链表可以实现**自我删除**。

具体操作如下：定义一个辅助变量temp = head.next;这里我们直接找到该结点所在的位置，所以temp直接等于head.next;还需要一个flag标记是否找到待删除结点。通过遍历找到链表的最后，然后让temp的前驱结点的next域直接指向temp的下一个结点，即**temp.pre.next = temp.next**;如果待删除结点不是最后的结点，则还需要执行下列操作：让temp的下一个结点的pre指向temp的前一个结点，即**temp.next.pre = temp.pre**;完成上述操作之后，待删除结点的前后指针都指向null，也就完成了删除。

**代码实现如下：**

```java
    public void del(int no) {
        // 判断当前链表是否为空
        if (head.next == null) {// 空链表
            System.out.println("链表为空，无法删除~");
            return;
        }
        HeroNode2 temp = head.next; // 辅助变量(指针)
        boolean flag = false; // 标志是否找到待删除节点的
        while (true) {
            if (temp == null) { // 已经到链表的最后
                break;
            }
            if (temp.no == no) {
                // 找到的待删除节点的前一个节点temp
                flag = true;
                break;
            }
            temp = temp.next; // temp后移，遍历
        }
        // 判断flag
        if (flag) { // 找到
            // 可以删除
            temp.pre.next = temp.next;
            // 如果是最后一个节点，就不需要执行下面这句话，否则出现空指针
            if (temp.next != null) {
                temp.next.pre = temp.pre;
            }
        } else {
            System.out.printf("要删除的 %d 节点不存在\n", no);
        }
    }
```



#### ⑤输出链表信息

和单链表操作相同。。。。

**代码实现如下：**

```java
    // 遍历打印输出链表信息
    public void show() {
        // 先判断链表是否为空
        if (head.next == null) {
            System.out.println("链表为空~");
            return;
        }
        // 因为头结点不能动，定义一个辅助变量用于遍历
        HeroNode2 temp = head.next;
        while (true) {
            // 判断是否到链表最后
            if (temp == null) {
                break;
            }
            // 输出结点信息
            System.out.println(temp);
            temp = temp.next;// 将temp后移！！！
        }
    }
```

---

## 三、结束语

到这里，我们完成了对于双链表的相关操作。双向链表相对于单链表来说，要更复杂一些，毕竟它多了pre指针，进行删除和操作的时候需要格外小心。另外它由于每个结点都需要记录两份指针，所以在空间上是要占用略多一些的。不过由于它良好的对称性，使得对某个结点的前后结点操作带来了方便，可以有效提高算法的时间性能。说白了，就是用空间换时间。

源代码——>[数据结构](https://github.com/QuakeWang/DataStructes)



>    《大话数据结构》 ——程杰
>
>    图解数据结构与算法——韩顺平