/**
 * Created with JetBrains WebStorm.
 * User: linpeng
 * Date: 13-8-29
 * Time: 下午5:41
 */
var Stack = function () {
    this.Init();
};

Stack.prototype = { Init:function () {
    this.STACKMAX = 100;
    this.stack = new Array(this.STACKMACK);
    this.top = -1;
    return this.stack;
}, Empty:function () {
    if (this.top == -1) {
        return true;
    } else {
        return false;
    }
}, Push:function (elem) {
    if (this.top == this.STACKMAX - 1) {
        return "Stack Full";
    } else {
        this.top++;
        this.stack[this.top] = elem;
    }
}, Pop:function () {
    if (this.top == -1) {
        return "Empty Stack,Cann't remove top element!";
    } else {
        var x = this.stack[this.top];
        this.top--;
        return x;
    }
}, Top:function () {
    if (this.top != -1) {
        return this.stack[this.top];
    } else {
        return "Empty Stack,No return top element!";
    }
}, Clear:function () {
    this.top = -1;
}, Length:function () {
    return this.top + 1;
} }