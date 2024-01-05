class Demo {
    static foo() {
        throw new Error("err!");
    }

    bar() {
        Demo.foo();
    }
}

process.nextTick(() => {
    new Demo().bar();
});
