---
title: "查找——折半查找"
date: 2020-09-08T10:58:26+08:00

---

# 折半查找

## 一、前言

### 1、基本介绍

**折半查找（BinarySearch）：** 又称二分查找。它的前提是线性表的记录必须是关键码有效（通常从小到大有序），线性表必须采用顺序存储。

**基本思想** ：在有序表中，取中间记录作为比较对象，若给定值与中间记录的关键字相等，则查找成功；若给定值小于中间记录的关键字，则在中间记录的左半区继续查找；若给定值大于中间记录的关键字，则在中间记录的右半区继续查找。不断重复上述过程，直到查找成功，或所有查找区域无记录，查找失败为止。

### 2、举栗子

现在有一个有序数组 {1，8，10，89，100，123}，假设我们需要寻找数字8这个数，步骤如下：

1.   首先确定该数组的中间值的下标，即 mid = (left + right) / 2;

2.   然后让需要查找的数findVal和arr[mid]比较；

     -    1）findVal > arr[mid] 说明要查找的数在mid的右边，因此需要递归的向右查找；
     -    2）findVal < arr[mid] 说明要查找的数在mid的左边，因此需要递归的向左查找；
     -    3）findVal == arr[mid] 说明找到，就返回下标

     ![binarysearch](https://raw.githubusercontent.com/QuakeWang/quakewang.github.io/master/imag/binarySearch.png)

### 3、思考

什么时候需要结束递归呢？？

-    找到就结束递归；
-    遍历完整个数组，仍然没有找到findVal，也需要结束递归，结束条件为： 左边的索引 大于 右边的索引，即 **left > right** 。

---

## 二、算法实现

### 1、非递归实现

折半查找既可以使用递归，也可以使用非递归来实现，这里我们先来了解一下非递归。left表示左边的索引，初始位置为数组的第一个元素；right表示右边的索引，初始位置为数组的最后一个元素。然后利用while循环进行遍历。当左边的索引大于右边的索引的时候，表示查找结束，没有查找到关键字，则返回-1，否则，返回该元素所在的下标。

中间值 mid初始值为 `mid = (left + right) / 2;` 若查找值比中值小，则最高下标调整到中位下标小一位；若查找值比中值大，则最高下标调整到中位下标大一位；依次类推。

**代码实现如下：**

```java
    // 非递归实现折半查找
    public static int binarySearch03(int[] arr, int left, int right, int findVal) {
        int mid = 0;
        int midVal = arr[mid];
        while (left <= right) {
            mid = (left + right) / 2;
            if (findVal < midVal) {
                right = mid - 1;
            } else if (findVal > midVal) {
                left = mid + 1;
            } else {
                return -1;
            }
        }
        return mid;
    }
```

### 2、递归实现

与非递归实现想类似，即根据关键字与中间值的大小，然后做出相应的判断，再分别向左或者向右进行递归。需要注意的是，要避免出现“死龟”的情况，也就是没有查找到所需要的关键字，但仍没有结束递归。因此，当左边的索引大于右边的索引时，即 `left > right`表示递归完整个数组，需要结束递归。还有就是需要注意每次递归的起始位置的变化。

**代码实现如下：**

```java
    /**
     * @param arr     数组
     * @param left    左边的索引
     * @param right   右边的索引
     * @param findVal 需要查找的值
     * @return 如果找到就返回下标，如果没有找到，就返回-1
     */
    public static int binarySearch01(int[] arr, int left, int right, int findVal) {
        // 当 left > right 时，说明递归完整个数组，但是没有找到
        if (left > right) {
            return -1;
        }
        int mid = (left + right) / 2;
        int midVal = arr[mid];

        if (findVal > midVal) {// 向右递归
            return binarySearch01(arr, mid + 1, right, findVal);
        } else if (findVal < midVal) {// 向左递归
            return binarySearch01(arr, left, mid - 1, findVal);
        } else {
            return mid;
        }
    }

```

### 3、完善版折半查找

假设，需要查找的关键字，在数组中有多个相同数值时， 在上述两个方法中，都是查找到一个关键字就返回，如何才能够将所有的数值都查找到呢？？

思路分析：

-    当查找到mid索引值时，先不要立刻返回；
-    向mid索引值的左边扫描，将所有满足元素的下标，加入到集合ArrayList；
-    向mid索引值的右边扫描，将所有满足元素的下标，加入到集合ArrayList；
-    最后将ArrayList返回即可。

**代码实现如下：**

```java
    public static List<Integer> binarySearch02(int[] arr, int left, int right, int findVal) {
        if (left > right) {
            return new ArrayList<Integer>();
        }
        int mid = (right + left) / 2;
        int midVal = arr[mid];

        if (findVal > arr[mid]) {
            return binarySearch02(arr, mid + 1, right, findVal);
        } else if (findVal < arr[mid]) {
            return binarySearch02(arr, left, mid - 1, findVal);
        } else {
            List<Integer> resIndexList = new ArrayList<>();
            // 向mid索引值左边扫描，将所有满足元素的下标，加入到集合ArrayList中
            int temp = mid - 1;
            while (true) {
                if (temp < 0 || arr[temp] != findVal) {// 没有找到，退出
                    break;
                }
                // 否则，将temp放入到resIndexList中
                resIndexList.add(temp);
                temp--;// temp左移
            }

            resIndexList.add(mid);

            // 向mid索引值右边扫描，将所有满足元素的下标，加入到集合ArrayList中
            temp = mid + 1;
            while (true) {
                if (temp > arr.length - 1 || arr[temp] != findVal) {
                    break;
                }
                resIndexList.add(temp);
                temp++;// temp右移
            }
            return resIndexList;
        }
    }
```

---

## 三、结束语

折半查找的前提条件是需要有序顺序存储，对于静态查找表，一次排序后不再变化，这样的算法已经比较好了。但是对于需要频繁执行插入或删除操作的数据集来说，维护有序的排序会带来不小的工作量，就不建议使用咯。

源码 ——> [折半查找](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/search/BinarySearch.java)