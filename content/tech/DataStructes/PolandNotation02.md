---
title: "栈的应用——后缀表达式02"
date: 2020-07-16T13:54:47+08:00
draft: true
---

# 后缀表达式——代码讲解

## 一、前言

在上一篇[博客中](https://quakewang.github.io/tech/polandnotation01/)我们介绍了有关后缀表达式的有关知识，关于如何将**中缀表达式**转换为**后缀表达式**，以及**后缀表达式的运算规则**，做了详细的介绍。因此这篇博客将会用代码来实现一个完整的后缀表达式。

---

## 二、算法描述

### 1、将后缀表达式的数据和运算符放入到ArrayList中

我们会获取到一个**String类型**的后缀表达式，因为对于字符串类型是无法正常完成计算的，因此需要先将后缀表达式里面的数据和运算符按照空格" "分割开，然后存放到ArrayList中。

这里会用到foreach遍历字符串，每遍历一个元素，再利用 **list.add()** 方法加入到List中，然后返回List即可。

**代码实现如下：**

```java
    // 依次将一个逆波兰表达式的数据和运算符放入到ArrayList中
    public static List<String> getListString(String suffixExpression) {
        // 将suffixExpression按照空格“ ”分开
        String[] split = suffixExpression.split(" ");
        List<String> list = new ArrayList<>();
        for (String ele : split) {
            list.add(ele);
        }
        return list;
    }
```

### 2、后缀表达式的运算

关于运算规则，在上一篇博客中已经做过说明，所以这里就不做过多的赘述。我们通过**栈**来存放扫描到的数字（*这里使用正则表达式来判断是否是多位数*）。扫描表达式的时候如果遇见运算符，则分别取出栈顶元素和次顶元素，进行计算，并把运算结果再重新入栈。最后留在栈中的数就是该表达式最后的运算结果。*需要注意的是：在进行减、除运算的时候，需要注意栈顶元素和次顶元素的位置*。

**代码实现如下：**

```java
    public static int calculate(List<String> ls) {
        // 创建一个栈（在这里只需要一个栈即可）
        Stack<String> stack = new Stack<String>();
        // 遍历ls
        for (String item : ls) {
            // 使用正则表达式来取出数
            if (item.matches("\\d+")) {// 匹配的是多位数
                // 入栈
                stack.push(item);
            } else {
                // pop出两个数，并运算，再入栈
                int num1 = Integer.parseInt(stack.pop());
                int num2 = Integer.parseInt(stack.pop());
                int res = 0;
                if (item.equals("+")) {
                    res = num2 + num1;
                } else if (item.equals("-")) {
                    res = num2 - num1;
                } else if (item.equals("*")) {
                    res = num2 * num1;
                } else if (item.equals("/")) {
                    res = num2 / num1;
                } else {
                    throw new RuntimeException("输入的运算符有误！！！");
                }
                // 把res入栈
                stack.push("" + res);// 加上双引号即可转换为字符串形式
            }
        }
        // 最后留在stack中的数据就是运算结果
        return Integer.parseInt(stack.pop());
    }
```

---

通过上述两种方法，可以实现对于后缀表达式的直接运算。但后缀表达式是计算机容易理解，而相对于人而言，其转换过程是比较头疼的，所以接下来我们实现关于中缀表达式转换后缀表达式的方法。

---

### 3、将中缀表达式转换成对应的List

对于一个字符串，我们是无法进行操作的，所以首先要做的就是先把中缀表达式转成对应的List。

需要的变量有： **ls(List)** 用于存放扫描得到的元素； **i(int)** 当作指针，用于扫描中缀表达式； **str(String)** 用于多位数的拼接； **c(char)** 每遍历一个字符，就放入到c。

这里我们使用**do……while**循环来进行遍历，循环的条件是**i < s.length()**;扫描遇到的如果是操作符，直接加入即可；如果是数字，则每次添加的时候先将**str置空**，然后利用**str += c**拼接多位数。每次扫描到一个元素之后，指针i需要进行后移，可以利用ASCII码来判断数字的范围，然后进行相关操作。

**代码实现如下：**

```java
    // 将中缀表达式转换成对应的List
    public static List<String> toInfixExpressionList(String s) {
        // 定义一个List，存放在中缀表达式中对应的内容
        List<String> ls = new ArrayList<>();
        int i = 0;// 这是一个指针，用于遍历中缀表达式字符串
        String str;// 用于多位数的拼接
        char c;// 每遍历一个字符，就放入到c
        do {
            // 如果是一个非数字，就需要加入到ls
            if ((c = s.charAt(i)) < 48 || (c = s.charAt(i)) > 57) {
                ls.add("" + c);
                i++;// i需要后移
            } else {// 如果是一个数，需要考虑多位数的情况
                str = "";// 先将str置空“ ”
                while (i < s.length() && (c = s.charAt(i)) >= 48 && (c = s.charAt(i)) <= 57) {
                    str += c;
                    i++;
                }
                ls.add(str);
            }
        } while (i < s.length());
        return ls;// 返回
    }
```

### 4、将中缀表达式对应的List转换成后缀表达式

关于中缀表达式转换的规则，在之前也进行过相关的阐述，这里也就不再细说了，不过需要注意的是转换之后的后缀表达式对应的也是List。对于运算符符号操作的时候，我们需要比较运算符的优先级，所以定义一个类，用于返回运算符的优先级。

**代码实现如下：**

```java
// 编写一个类Operation
class Operation {
    private static int ADD = 1;
    private static int SUB = 1;
    private static int MUL = 2;
    private static int DIV = 2;

    // 编写一个方法，返回对应的优先级数字
    public static int getValue(String operation) {
        int result = 0;
        switch (operation) {
            case "+":
                result = ADD;
                break;
            case "-":
                result = SUB;
                break;
            case "*":
                result = MUL;
                break;
            case "/":
                result = DIV;
                break;
            default:
                System.out.println("不存在该运算符" + operation);
                break;
        }
        return result;
    }
}
```

**具体操作代码如下：**

```java

    // 将得到的中缀表达式对应的List转换成后缀表达式对应的List
    public static List<String> parseSuffixExpressionList(List<String> ls) {
        // 定义一个栈，用于存放扫描所得到的符号
        Stack<String> s1 = new Stack<>();// 符号栈
        // 定义一个ArrayList用于存储中间的结果
        List<String> s2 = new ArrayList<>();

        // 遍历
        for (String item : ls) {
            // 如果是一个数，加入s2
            if (item.matches("\\d+")) {
                s2.add(item);
            } else if (item.equals("(")) {
                s1.push(item);
            } else if (item.equals(")")) {
                // 如果是右括号")"，则依次pop出s1栈顶的运算符，并加入s2，直到遇见左括号为止，此时将这一对括号丢弃
                while (!s1.peek().equals("(")) {
                    s2.add(s1.pop());
                }
                s1.pop();// 将 ( 弹出s1栈，消除小括号
            } else {
                // 当item的优先级小于或等于s1栈顶运算符，将s1栈顶的运算符弹出，并加入到s2中然后再与s1中新的栈顶运算符相比较
                while (s1.size() != 0 && Operation.getValue(s1.peek()) >= Operation.getValue(item)) {
                    s2.add(s1.pop());
                }
                s1.push(item);
            }
        }

        // 将s1中剩余的运算符依次弹出并加入到s2
        while (s1.size() != 0) {
            s2.add(s1.pop());
        }
        return s2;// 注意：因为是存放到List，因此按顺序输出就是对应后的后缀表达式对应的List
    }

```

---

## 三、结束语

对于栈的应用，使用了*中缀表达式*和*后缀表达式*来进行说明，由此可见，想把数据结构学好还是得下一定功夫的，世界上没有随随便便的成功，一步一步踏踏实实地向前走。

源码 —— > [PolandNotation](https://github.com/QuakeWang/DataStructes/blob/master/src/com/quake/stack/PolandNotation.java)