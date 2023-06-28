---
title: "栈的应用——中缀表达式"
date: 2020-07-06T21:15:48+08:00
draft: true
---

# 中缀表达式

## 一、前言

栈的现实应用有很多，这次我们重点来说一下，关于如何使用栈来求数学表达式的值，这里我们描述的为**中缀表达式**，也就是我们在日常生活中经常使用的四则运算式的形式。

大家是否还记得，当我们在上小学的时候，老师们时常强调的“先乘除后加减，从左往右算”之类的话呢？？这其实就是四则运算的规则，那么在我们学习编程之后，该如何使用程序来解决这个问题呢？？

## 二、算法描述

我们需要一个栈来存放数据（**数栈numStack**）和另一个栈来存放运算符（**符号栈operStack**）。那么在此之前，我们需要定义一个类来表示栈。

### 1、定义一个类表示栈

在这个类中，我们需要完成的方法有：判断栈满栈空、入栈、出栈、查看栈顶元素、判断是否是运算符、比较运算符的优先级以及运算方法。

在这里有些方法以及变量的说明，在[数组模拟栈](https://quakewang.github.io/tech/arraystackdemo/)已经做出相关说明，这里就直接使用，不做过多的解释。

#### ①定义相关变量及赋值

**代码实现如下：**

```java
    private int[] stack;// 数组，用于模拟栈，数据就存放在该数组
    private int maxSize;// 栈的大小
    private int top = -1;// 表示栈顶，初始化为-1

    // 构造器
    public ArrayStack2(int maxSize) {
        this.maxSize = maxSize;
        stack = new int[this.maxSize];
    }
```

#### ②判断栈满 栈空

**代码实现如下：**

```java
    // 栈满
    public boolean isFull() {
        return top == maxSize - 1;
    }

    // 栈空
    public boolean isEmpty() {
        return top == -1;
    }
```

#### ③入栈 —— push

**代码实现如下：**

```java
    // 入栈 —— push
    public void push(int value) {
        if (isFull()) {
            System.out.println("栈满");
            return;
        }
        top++;
        stack[top] = value;
    }
```

#### ④出栈 —— pop

**代码实现如下：**

```java
    // 出栈 —— pop
    public int pop() {
        if (isEmpty()) {
            throw new RuntimeException("栈空，没有数据~~~");
        }
        int value = stack[top];
        top--;
        return value;
    }
```

#### ⑤查看栈顶元素

在这里增加一个方法，用于返回当前栈顶的值，但不是真正的top。那么有些小伙伴可能会问，为什么会在这里增加一个查看栈顶元素的方法呢？？其实我们在存放运算符入符号栈的时候，需要先判断入栈元素与栈顶元素的优先级。这里增加查看栈顶元素的方法，就不用再取出栈顶元素咯，更加有利于我们进行比较运算符的优先级。

**代码实现如下：**

```java
    // 增加一个方法，可以返回当前栈顶的值，但不是真正的top
    public int peek() {
        return stack[top];
    }
```

#### ⑥判断是否是运算符

这个方法用于判断表达式中的元素是否是运算符，如果是运算符则直接入符号栈。在这里我们只考虑"+"、"-"、"*"、"/"四种运算符。

**代码实现如下：**

```java
    // 判断是否是运算符
    public boolean isOper(char val) {
        return val == '+' || val == '-' || val == '*' || val == '/';
    }
```

#### ⑦比较运算符的优先级

因为进行四则运算需要遵循”先乘除后加减“的规则，所以需要规定运算符的优先级。我们在这里规定：优先级越高，则返回的数字越大。

**代码实现如下：**

```java
    // 返回运算符的优先级，优先级是由程序猿来确定的，使用数字表示
    // 这里规定：优先级越高，返回的数字越大
    public int priority(char oper) {
        if (oper == '*' || oper == '/') {
            return 1;
        } else if (oper == '+' || oper == '-') {
            return 0;
        } else {
            return -1;// 假定目前表达式的运算符只有+、-、*、/
        }
    }
```

#### ⑧计算方法

具体的计算流程如下：分别从数栈pop出两个数：*num1*和*num2*，以及从符号栈pop出一个符号：*oper*，然后根据pop出的符号进行相关运算。

在这里我们需要注意的是：因为num1是先取出的，num2是后取出的，所以在进行减除运算的时候，需要注意一下顺序。

**代码实现如下：**

```java
    // 计算方法
    public int cal(int num1, int num2, char oper) {
        int res = 0;// res用于存放计算的结果
        switch (oper) {
            case '+':
                res = num1 + num2;
                break;
            case '-':
                res = num2 - num1;
                break;
            case '*':
                res = num2 * num1;
                break;
            case '/':
                res = num2 / num1;
                break;
            default:
                break;
        }
        return res;
    }
```

---

### 2、具体运算操作

#### ①相关变量的定义

我们前文提到了，需要一个数栈**numStack**，用于存放从表达式中扫描得到的数字；再定义一个符号栈**operStack**，用于存放扫描得到的运算符；定义一个**index**用于扫描表达式；**num1、num2、oper**分别表示取出的数字和运算符。再定义一个字符类型的变量**ch**，用于存放每次扫描所得到的运算符；定义**res**用于存放经过计算之后的数；在对于数字进行扫描到时候，如果是多位数，不能发现是一个数就入栈，需要往后面再看一位，如果是数字就继续扫描，否则push入栈，因此需要定义一个变量**keepNum**用于拼接多位数。

**代码实现如下：**

```java
        String expression = "7*21*2-5+1-5+3-4+2/1";
        //创建两个栈，一个数栈，一个符号栈
        ArrayStack2 numStack = new ArrayStack2(100);
        ArrayStack2 operStack = new ArrayStack2(100);
        //定义需要的相关变量
        int index = 0;//用于扫描
        int num1 = 0;
        int num2 = 0;
        char oper = 0;
        int res = 0;
        char ch = ' ';//将每次扫面得到的运算符保存到ch
        String keepNum = "";//用于拼接,处理扫描到的数字是多位数
```

#### ②扫描表达式

这一步是程序的核心内容，也是运算实现的关键步骤。我们可以使用**while循环**来操作。

首先，利用**index**索引进行扫描表达式，依次得到表达式的每一个字符，可以使用**substring()**来操作，即**ch = expression.substring(index,index+1).charAt(0);** 在得到表达式的各个字符之后，然后判断ch是什么符号。

先假设扫描得到的**ch**是运算符。如果此时符号栈**operStack**中已经有运算符，则需要比较当前运算符和栈顶元素的运算符的优先级，如果当前的操作运算符的优先级**小于或者等于**栈中的操作符，就需要从数栈中pop出两个数再从符号栈中pop出一个符号，进行运算，将得到的结果，入数栈，然后将当前的运算符入符号栈。（*注意：别忘了把当前的运算符push入符号栈*）；如果当前的运算符的优先级**大于**栈中的运算符，则直接入符号栈。另外注意，我们到现在为止，所描述的都是符号栈内有操作符的情况，如果符号栈为空，直接push当前运算符入栈即可。

**代码实现如下：**

```java
            if (operStack.isOper(ch)) {//如果是运算符
                //判断当前的符号栈是否为空
                if (!operStack.isEmpty()) {
                    //如果符号栈有操作符，就进行比较，如果当前的操作运算符的优先级小于或者等于栈中的操作符，就需要从数栈中pop出两个数
                    //再从符号栈中pop出一个符号，进行运算，将得到的结果，入数栈，然后将当前的运算符入符号栈
                    if (operStack.priority(ch) <= operStack.priority((char) operStack.peek())) {
                        num1 = numStack.pop();
                        num2 = numStack.pop();
                        oper = (char) operStack.pop();
                        res = numStack.cal(num1, num2, oper);
                        //把运算的结果入数栈
                        numStack.push(res);
                        //然后将当前的操作符入符号栈
                        operStack.push(ch);
                    } else {
                        //如果当前的操作符的优先级大于栈中的操作符，就直接入符号栈
                        operStack.push(ch);
                    }
                } else {
                    //如果为空直接入符号栈
                    operStack.push(ch);
                }
            }
```



现在我们来假设如果扫描得到的是数字，将会如何操作呢？？因为扫描得到的数字，其实是字符型，所以需要转化为整型，这里使用的是**Integer**。还有需要注意的就是，该如何处理多位数的问题。

```
分析思路：
* 1、当处理多位数时，不能发现是一个数就立即入栈，因为它有可能是多位数
* 2、在处理数时，需要向expression的表达式的index 后再看一位，如果是数就进行扫描，如果是符号才入栈
* 3、因此需要定义一个变量 字符串，用于拼接
```

在定义变量的时候我们提到了**keepNum**，可以使用它来拼接多位数，即**keepNum += ch;** 但是如果扫描得到的数字是最后一个数字，直接push入栈即可；如果不是最后一位，就需要*往后看一位*，若后面一位还是数字，则需要继续扫描，直到不是数字为止，同样可以利用**substring**来实现。每次扫描完成之后需要将拼接符**keepNum**清空，这一步是千万不能少！！！

**代码实现如下：**

```java
            else {//如果是数，则直接入数栈
                //处理多位数
                keepNum += ch;

                //如果ch已经是expression的最后一位，就直接入栈
                if (index == expression.length() - 1) {
                    numStack.push(Integer.parseInt(keepNum));//Integer将字符串转化为整型
                } else {
                    //判断下一个字符是不是数字，如果是数字，就继续扫描，如果是运算符，则入栈
                    //注意是最后一位，不是index++
                    if (operStack.isOper(expression.substring(index+1,index+2).charAt(0))) {
                        //如果后一位是运算符，则入栈 keepNum = "1" 或者 ”123“
                        numStack.push(Integer.parseInt(keepNum));
                        //重要！！！！！，keepNum清空
                        keepNum = "";
                    }
                }
            }
```

在完成上述操作之后，需要将**index**后移，直到index的比表达式长度的值大时，退出循环。

**代码实现如下：**

```java
            //让index + 1，并判断是否扫描到expr最后
            index++;
            if (index >= expression.length()) {
                break;
            }
```

#### ③完成计算

在完成扫描之后，就顺序从数栈和符号栈中pop出相应的数字和符号完成计算。

同样可以利用**while循环**来完成。将最后的计算结果**res**入数栈。别忘了把数栈中最后的数取出，这个数就是表达式的计算结果。

**代码实现如下：**

```java
        //当表达式扫描完毕，就顺序的从 数栈和符号栈中pop出相应的数和符号，并运行
        while (true) {
            //  如果符号栈为空，则运算到最后的结果，数栈中只有一个数字【结果】
            if (operStack.isEmpty()) {
                break;
            }
            num1 = numStack.pop();
            num2 = numStack.pop();
            oper = (char) operStack.pop();
            res = numStack.cal(num1, num2, oper);
            numStack.push(res);//入栈
        }
        //将数栈的最后数，pop出，就是结果
        int res2 = numStack.pop();
        System.out.printf("表达式%s = %d\n",expression,res2);
    }
```

---

## 三、结束语

关于使用栈实现中缀表达式的描述，真的太吃力了，能明显感觉到需要描述不清晰的地方，如果小伙伴们有较好的阐述方法或者建议，都可以提交pr或者issue。

源码——> [Calculator](https://github.com/QuakeWang/DataStructes/blob/master/src/com/quake/stack/Calculator.java)