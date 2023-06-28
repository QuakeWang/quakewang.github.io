---
title: "查找——插值查找"
date: 2020-09-10T09:13:35+08:00
draft: true
---

# 插值查找

## 一、前言

### 1、问题引入

在了解过[折半查找](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/search/BinarySearch.java) 之后，可能有些人会有些疑问，为什么选择的是1/2，而不是 1/3 、1/4 呢？？或者说折更多呢？？

举个例子，比如说我们在26个英文字母中寻找A，你还会选择折半么，从中间开始向左边部分进行递归？？还是直接从头开始查找、 在这种情况下，折半查找就显得不是那么的好用咯，还存在可以优化的地方。

### 2、基本介绍

我们来看一下折半查找的中间值 `mid = (left + right) / 2;` 通过我们小学一年级学过的数学知识，可以得出 => `mid = left + (right - left) / 2;` 也就是mid等于最底下标left加上最高下标right与left差的一半。然后再次利用小学一年级的知识，对于这个 1/2 进行优化，得出 `mid = left + (right - left) * (findVal - arr[left]) / (arr[right] - arr[left]);` 

将 1/2 改成 (findVal - arr[left]) / (arr[right] - arr[left]) 有什么好处呢？？假设arr[10] = {1, 2, 3, 4 ,5 6, 7, 8, 9}，则left = 0、right = 8、arr[left] = 1、arr[right] = 9。需要查找关键字1，代入上述公式可得 mid = 0，那么就说明只需要一次，感兴趣的可以自己使用折半查找计算一下， 从而可以发现在这种情况下，还是插值查找好使。

>    **插值查找：** 是根据要查找的关键字findVal与查找表中最大最小记录的关键字比较后的查找方法，其核心在于插值的计算公式  (findVal - arr[left]) / (arr[right] - arr[left])。

---

## 二、算法实现

**代码实现如下：**

```java
    /**
     * 说明：差债查找算法，也要求数组是有序的
     *
     * @param arr     数组
     * @param left    左边索引
     * @param right   右边索引
     * @param findVal 查找值
     * @return 如果找到，就返回对应的下标，如果没有找到就返回-1
     */
    public static int insertValueSearch(int[] arr, int left, int right, int findVal) {
        //注意：findVal < arr[0] 和 findVal > arr[arr.length - 1]必须需要，否则得到的mid可能会越界
        if (left > right || findVal < arr[0] || findVal > arr[arr.length - 1]) {
            return -1;
        }

        // 求出mid
        int mid = left + (right - left) * (findVal - arr[left]) / (arr[right] - arr[left]);
        int midVal = arr[mid];
        if (findVal > midVal) {
            return insertValueSearch(arr, mid + 1, right, findVal);
        } else if (findVal < midVal) {
            return insertValueSearch(arr, left, mid - 1, findVal);
        } else {
            return mid;
        }
    }
```



---

## 三、结束语

插值查找一般适用于表长较大的，而且关键字分布又比较均匀的查找表来说，插值查找算法的平均性能是优于折半查找的，但如果是表长较小的情况、或者关键字分布不均与的情况，再使用插值查找或许就不是那么合适的了。

源码 ——> [插值查找](https://github.com/QuakeWang/DataStructure/blob/master/src/com/quake/search/InsertValueSearch.java)

