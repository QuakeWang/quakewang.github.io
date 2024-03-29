---
title: "排序——冒泡排序"
date: 2020-08-12T16:54:54+08:00
draft: true
---

# 冒泡排序

## 一、前言

回想起来，当时一开始接触编程的时候，在学完循环和数组之后，老师便给我们讲解了**冒泡排序** ，老师还开玩笑说这种排序的算法最简单，相对而言也最容易理解。但对于当时的我们来说听得还是云里雾里的。

>**冒泡排序（Bubble Sort）** 一种交换排序，它的基本思想是：两两比较相邻记录的关键字，如果反序则交换，直到没有反序的记录为止。

因为排序的过程（如果相邻的元素逆序就交换）就像是水中的气泡一样往上冒，因此得名叫做冒泡排序。下面举一个简单的栗子：

原始数组：3，9，-1，10，20 

-    第一趟排序：

1）3，9，-1，10，20 // *3和9比较，3比9小，位置不变*

2）3，-1，9，10，20 // *9和-1比较，发现逆序，交换位置* 

3）3，-1，9，10，20 // *9和10比较，位置不变*

4）3，-1，9，10，**20** // *10和20比较，从而确定第一趟排序下来最大的数20*

-    第二趟排序：

1）-1，3，9，10，**20** // *3和-1比较，发现逆序，交换位置*

2）-1，3，9，10，**20** // *3和9比较，位置不变*

3）-1，3，9，**10**，**20** // *9和10比较，从而确定第二趟排序下来最大的数10*

-    第三趟排序：

1）-1，3，9，**10**，**20** // *-1和3比较，位置不变*

2）-1，3，**9**，**10**，**20** // *3和9比较，从而确定第三趟排序下来最大的数9*

-    第四趟排序：

1）-1，**3**，**9**，**10**，**20** // *-1和3比较，从而确定第四趟排序下来最大的数3*

**小结：**

1.   一共进行 **数组的大小 - 1 次** 大的循环；
2.   每一趟排序的次数在逐渐的减少。

---

## 二、算法实现

### 1、排序

冒泡排序的算法实现，并不难理解，我们使用双重for循环遍历即可。只不过需要注意的是每一次循环时候的条件。外层循环 `for(int i = 0; i < arr.length - 1; i++)` 表示的是**每一趟循环**，所需要的次数就是*数组大小-1* 。而内层循环 `for(int j = 0; j < arr.length - i - 1; j++)`  表示的是每一趟需要排序的元素的的个数。

```java
    // 冒泡排序方法
    public static void bubbleSort(int[] arr) {
        int temp = 0;// 临时变量
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
```

### 2、优化

在使用冒泡排序的时候，我们不难发现，如果一串数字中有部分两两相邻的元素是顺序的，但是仍然执行 `swap函数` 的操作，这样一来极大程度上降低了排序的效率。针对以上出现的情况，我们做出如下的优化：

增加一个布尔类型的变量`flag` 作为标识符，用于判断，当前的两两相邻的元素是否是按照顺序的，如果是就跳出，继续排查下一个元素，依次类推。

**代码实现如下：**

```java
    // 冒泡排序方法
    public static void bubbleSort(int[] arr) {
        boolean flag = false;// 标识符
        int temp = 0;// 临时变量
        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    flag = true;
                    temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
            if (!flag) {// 在一趟排序中，一次交换都没有发生过
                break;
            } else {
                flag = false;// 重置flag进行下次判断
            }
        }
    }
```

---

## 三、结束语

以上便是关于冒泡排序的基本内容了。如果还有描述不清或者是无法理解的，可以适当画图结合debug进行调试，细心点，坚持下去，总会有结果的。

分析一下它的时间复杂度。当最好的情况，也就是要排序的表本身就是有序的，那么我们比较次数，根据最后改进的代码，可以判断出就是 n - 1 次的比较。没有数据交换，时间复杂度为O(n)。当最坏的情况，即待排序表示逆序的情况，此时需要比较 n*(n - 1) / 2 次，并作等数量级的记录移动。因此，总的时间复杂度为O(n^2)。

源码 ——> [BubbleSort](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/sort/BubbleSort.java)