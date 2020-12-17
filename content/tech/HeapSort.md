---
title: "排序——堆排序"
date: 2020-10-29T11:26:47+08:00
---

# 堆排序

## 一、前言

### 0、牢骚话

说实话，有点惭愧，十月份真的咕咕了好久。。。可能是因为真的比较忙，忙着参加比赛，忙着开源年会，其实这都是借口、要是想更，时间总是可挤得出来的。也许是越往后，牵涉到的内容也就越多，可能是知识点掌握的不太牢固，就一直懒得水文章（*其实前面几篇文章已经暴露这个问题，只不过还是硬着头皮在做*）。针对以上出现的问题，我就毅然决然的选择先缓，静下心来，再好好琢磨琢磨。

### 1、堆的基本介绍

说到堆排序，大家可能会想到“堆”，为什么叫堆排序呢？其实不难不理解，我们都见过“堆”型的东西，比如金字塔。。那么这个和排序有什么关系呢？？下面我们来看一下关于堆的定义：

>    **堆是具有以下性质的完全二叉树：每个结点的值都大于或等于其左右孩子结点的值，称为大顶堆；或者每个结点的值都小于或等于其左右孩子结点的值，称为小顶堆。如下图：**

![HeapSort00](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort00.png?raw=true)

对吧，是不是堆形的。其实我们利用上一节说过[线索化二叉树](https://quakewang.github.io/tech/threadedbinarytree/)，将其存放在数组中进行操作，如下：

![HeapSort001](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort001.png?raw=true)

这个数组从逻辑上说就是一个堆的结构，经过前人的总结，我们可以使用简单的公式描述一下堆：

-    **大顶堆：arr[i] >= arr[2i+1] && arr[i] >= arr[2i+2]**  

-    **小顶堆：arr[i] <= arr[2i+1] && arr[i] <= arr[2i+2]**  

说到这儿，想必大家对于堆这种结构已经有了简单的了解，接下来我们来一探究竟，看看如何来实现排序的。

### 3、堆排序的基本思想

注：一般升序采用大顶堆，降序采用小顶堆。

>    **堆排序的基本思想是：将待排序序列构造成一个大顶堆，此时，整个序列的最大值就是堆顶的根节点。将其与末尾元素进行交换，此时末尾就为最大值。然后将剩余n-1个元素重新构造成一个堆，这样会得到n个元素的次小值。如此反复执行，便能得到一个有序序列 **

#### ①步骤一：构造初始堆

将给定无序序列构造成一个大顶堆

##### a.假设给定无序序列结构如下：

![Step01](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort01.png?raw=true)

##### b.此时我们从最后一个非叶子结点开始（叶结点自然不用调整，第一个非叶子结点 arr.length/2-1=5/2-1=1，也就是下面的6结点），从左至右，从下至上进行调整。

![Step02](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort02.png?raw=true)

##### c.找到第二个非叶节点4，由于[4,9,8]中9元素最大，4和9交换。

![Step03](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort03.png?raw=true)

##### d.这时，交换导致了子根[4,5,6]结构混乱，继续调整，[4,5,6]中6最大，交换4和6。

![Step04](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort04.png?raw=true)

此时，如此反复通过上述步骤，我们就将一个无序序列构建成了一个大顶堆。

#### ②步骤二：将堆顶元素与末尾元素进行交换，使末尾元素最大。然后继续调整堆，再将堆顶元素与末尾元素交换，得到第二大元素。如此反复进行交换、重建、交换。

##### a.将堆顶元素9和末尾元素4进行交换

![Step05](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort05.png?raw=true)

##### b.重新调整结构，使其继续满足堆定义

![Step06](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort06.png?raw=true)

##### c.再将堆顶元素8与末尾元素5进行交换，得到第二大元素8.

![Step07](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort07.png?raw=true)

##### d.后续过程，继续进行调整，交换，如此反复进行，最终使得整个序列有序

![Step08](https://github.com/QuakeWang/quakewang.github.io/blob/master/imag/HeapSort08.png?raw=true)

#### ③小结

再简单总结下堆排序的基本思路：

　　**a.将无序序列构建成一个堆，根据升序降序需求选择大顶堆或小顶堆;**

　　**b.将堆顶元素与末尾元素交换，将最大元素"沉"到数组末端;**

　　**c.重新调整结构，使其满足堆定义，然后继续交换堆顶元素与当前末尾元素，反复执行调整+交换步骤，直到整个序列有序。**

---

## 二、算法实现

经过上述的介绍，大致对于堆排序都有了一个简单的了解，但是具体一点，可能还是比较迷，最起码应该知道两个步骤：①构建一个大顶堆（或小顶堆）；②进行排序。下面我们上手代码，通过代码和图解效果可能会好点。

### 1、构建大顶堆

将一个数组（二叉树），调整成一个大顶堆。（*功能：完成将以i对应对的非叶子结点的树，调整成大顶堆*）这里我们对传入的数组进行升序操作，所以采用大顶堆，反之使用小顶堆即可。

首先需要有传入的待排序数组`int[] arr`、非叶子结点在数组中的索引`int i` 、对应多少个元素进行调整`int length`，我们需要注意的是随着构建的过程length是在逐渐减少的。好了，知道了应该传入哪些变量之后，我们开始动工！！！（可能比较难理解，我会尽量按照我理解的思路来阐述）

我们知道i表示的是一个非叶子结点，所以先把这个结点的值取出临时保存在一个临时变量中（*后期有用的*）`int temp = arr[i];` 然后我们依次遍历该结点的左右子结点并比较其大小，选出较大的一个与当前i对应的结点进行比较，最后把最大的值放在顶部，注意哦这里是局部顶部，因为对应的是该非叶子结点的一颗树。

这时，我们知道了无非就是比较一个非叶子结点的左右子树与该结点的大小，然后选出一个最大的放在顶部嘛，但是具体一点该怎么操作呢？？看下去咯。。

这里使用for循环来遍历其该结点的左右子树，`for(int k = i * 2 + 1; k < length; k = k * 2 + 1)` 。k通过执行 k = i * 2 + 1之后，这是的k指向的是i结点的左子结点。然后比较其与右子树的大小`arr[k] < arr[k + 1]`，这时我们将k指向较大的一颗子树即可，通过`k++`来实现，（*因为右子树的下标比左子树大一*）。这是我们已经选取了左右子树中较大的一个，然后将其与i结点所在的元素比较。然后子结点大于父结点`arr[k] > temp` ，把较大的值赋给当前结点`arr[i] arr[k]`，别忘了还要将i指向k`i = k` ，继续循环比较；如果父结点最大，我们直接break即可。因为是**从左至右，从下至上调整**的，所以不会出现漏判的情况。当for循环结束后，已经将i为父结点的树的最大值，放在了最顶（局部）。这时我们还需要把temp临时保存的值放置到调整后的位置`arr[i] = temp` 。如此反复就能成功构建出一个大顶堆。

**代码实现如下：**

```java
    /**
     * 将一个数组（二叉树），调整成一个大顶堆
     * 功能：完成将以i对应的非叶子结点的树，调整成大顶堆
     *
     * @param arr    待调整的数组
     * @param i      表示非叶子结点在数组中的索引
     * @param length 表示对应多少个元素进行调整，length是在逐渐的减少
     */
    public static void adjustHeap(int[] arr, int i, int length) {
        int temp = arr[i];// 先取出当前元素的值，保存在临时变量

        // 说明：k = i * 2 + 1 k是i结点的左子结点
        for (int k = i * 2 + 1; k < length; k = k * 2 + 1) {
            if (k + 1 < length && arr[k] < arr[k + 1]) {
                k++;// k指向右子结点
            }
            if (arr[k] > temp) {// 如果子结点大于父结点
                arr[i] = arr[k];// 把较大的值赋给当前结点
                i = k;// i指向k，继续循环比较
            } else {
                break;
            }
        }
        // 当for循环结束后，已经将i为父结点的树的最大值，放在了最顶（局部）
        arr[i] = temp;// 将temp值放到调整后的位置
    }
```

### 2、堆排序的方法

根据上文提到的堆排序的思想有：

#### ①将无序序列构建成一个堆

```java
        for (int i = arr.length / 2 - 1; i >= 0; i--) {
            adjustHeap(arr, i, arr.length);
        }
```

根据线索化二叉树可知，该树中非叶子结点的位置在`arr.length / 2 - 1` 的位置，调用`adjustHeap(arr, i, arr.length);` 即可。

#### ②将堆顶元素与末尾元素交换，将最大元素“沉”到数组末端

#### ③重新调整结构，使其满足堆定义，然后继续交换堆顶元素与当前末尾元素，反复执行调整，直到整个序列有序

```java
        for (int j = arr.length - 1; j > 0; j--) {
            // 交换
            temp = arr[j];
            arr[j] = arr[0];
            arr[0] = temp;
            adjustHeap(arr, 0, j);
        }
```

在完成上述操作之后，我们也就有了一个完成的有序序列。

**完整代码如下：**

```java
    // 编写一个堆排序的方法
    public static void heapSort(int[] arr) {
        int temp = 0;

        // 1、将无序序列构建成一个堆，根据升序降序需求选择大顶堆或小顶堆
        for (int i = arr.length / 2 - 1; i >= 0; i--) {
            adjustHeap(arr, i, arr.length);
        }

        // 2、将堆顶元素与末尾元素交换，将最大元素“沉”到数组末端
        // 3、重新调整结构，使其满足堆定义，然后继续交换堆顶元素与当前末尾元素，反复执行调整，直到整个序列有序
        for (int j = arr.length - 1; j > 0; j--) {
            // 交换
            temp = arr[j];
            arr[j] = arr[0];
            arr[0] = temp;
            adjustHeap(arr, 0, j);
        }
    }
```

---

## 三、结束语

堆排序确实有点难度，但其本质还是以二叉树的形式存储的数组，如果有不理解的地方可以debug然后结合画图来理解，文字描述确实太难了。。。。

源码地址 ——> [堆排序](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/tree/HeapSort.java)