---
title: 'NodeJS: Not So Single Threaded'
date: '2022-11-11'
authorName: 'Varun'
slug: '/blog/nodejs-not-so-single-threaded'
authorImg: '../about/me.jpg'
featuredImg: '../images/nodejs-wall.jpeg'
tags:
  - nodejs
  - multi-tasking
  - performance
show: 'true'
---

In today's world more than 30 million websites uses NodeJS. NodeJS is being used by at least 30 million websites. With NodeJS, PayPal and Netflix cut their startup times from more than 40+ minutes to under a minute. Companies have seen a 12% reduction in development costs after using NodeJS. NodeJS is the first choice when it comes to building scalable web applications.

So, how NodeJS being single threaded able to achieve all of this. Let's deep dive into the internals of NodeJS to see how it works.

So when we say NodeJS is single threaded, it means that all the Javascript like every single javascript file you wrote and are there in your modules, also the javascript that is in Node itself and Node does have JavaScript as part of it, all of them runs in a one single thread which we typically call the main thread. So this is what we mean when we say Javascript is single threaded because all these things are running in a single thread however there is little more to NodeJS, there's actually a fair amount of C++ code in NodeJS too. I forgot the ratio but I thinks It is 2/3rd JavaScript to 1/3rd C++ and that's a pretty good chunk and C++ is different because C++ has access to threads but it depends on how it's being run.

If you have a JavaScript method that you're calling from Node and it's backed by a C++ method and if it's a synchronous javascript call then that C++ code will always run on the main thread.

However if you're calling an asynchronous method from JavaScript and this method is backed by some C++, sometimes it runs on the main thread and sometimes it doesn't, it actually depends on the context in which you're making this function call.

To understand this a bit better, we're going to look at some examples.

### Example #1

We'll first look at the `crypto` module because it has lot of methods in it some asynchronous and some asynchronous, and they are very CPU intensive they do a lot of math and it takes a lot of time so we'll start by looking at the pbkdf2 method, this is a method for hashing so we take some random string we feed it into this and it'll give us a hash out. What we're gonna do is we're gonna start by calling the synchronous version of this method I'm going to call it four times

```js
const crypto = require('crypto');

const NUM_REQUESTS = 4;

for(let i = 0; i < NUM_REQUESTS; i++) {
    crypto.pbkdf2Sync("secret", "salt", 10000, 512, 'sha512');
}
```

so it's gonna call it once and then the time after that, so when we run this code we get an execution timeline that looks like this

![crypto-sync-4](../images/crypto-sync-4.png)

and this is what we would expect for synchronous code. we call it once it's gonna start it's gonna run to completion and then once it's done we're gonna call  the next one and it's gonna run until completion and we see that this took about 190 milliseconds.

Now we're gonna make one single change

```js
const crypto = require('crypto');

const NUM_REQUESTS = 4;

for(let i = 0; i < NUM_REQUESTS; i++) {
    crypto.pbkdf2("secret", "salt", 10000, 512, 'sha512', () => {});
}
```

so this the exact same code that we saw earlier except, instead of calling the synchronous version pbkdf2 we are calling the asynchronous version, everything else is exactly the same except we swapped those out and so when we run this code we get an execution time line that looks like

![crypto-async-4](../images/crypto-async-4.png)

 we can see that we did those four same calls and they took about the same time for each one but it was actually
able to run them in parallel and so we can see the whole thing took less than 60 milliseconds, that is quite a bit faster than the synchronous version and so what this tells us is that we didn't write any threading code inside of JavaScript we just wrote normal regular JavaScript and yet it was actually able to run these to operations in parallel and it turns out under the hood it actually ran these in separate threads because there's some C++ methods that Node uses to actually compute this and BTW there's a recommendation with Node that you always use the asynchronous methods whenever possible this is exactly why  because by using the asynchronous methods in a lot of cases Node is able to automatically run things in parallel for you but if you use the synchronous methods, you never give Node the chance to do that so you always want to use asynchronous because you can get some pretty big performance benefits a lot of the time.

We saw for both synchronous and asynchronous now let's say we increase this from four requests to six requests

![crypto-async-6](../images/crypto-async-6.png)

This is a little more interesting graph, this is not uniform anymore. We had this like weird little tail that's sitting at the end so it's almost look like we took the time when we did only four requests and sort of stuck that to the end and there's actually reason for this and that's because you know these hashing operation in C++ are done in a background thread but Node doesn't spin up a new thread for each request instead Node.js whenever it first starts up it will automatically spin up a preset number of threads which defaults to four. It will spin up these four threads and will constantly reuse those threads for all of its work, and these set of threads is called the thread pool in Node.js and the reason that when we saw four ran together and then the long tail was because we had this default four worker threads in the thread pool so what NodeJS is doing, whenever we make these requests, it can see that first request come through then Node would be like _okay I got this I'm gonna assign this to the first thread in the thread pool, the second request will go to the second, the third to the third, fourth to the fourth_ but when that fifth request comes through Node gonna say _alright all of my worker threads are busy right now so I'm gonna take this other request in a queue until one of the worker threads becomes available_ and then the same thing with the six requests so once that first request finishes. Node can say like _"Alright so now I have one of these threads available again I'm gonna pick off one of these queued requests and assign it to the next two."_ so that's why it really does look like it did four operations and then two because that's actually what it did under the hood and so this is a case where we're actually seeing the limitation in the thread pool

### Example #2

```js
const https = require('https');

const NUM_REQUESTS = 4;

for(let i = 0; i < NUM_REQUESTS; i++) {
    https.request('https://varunzxzx.github.io/static/.../.../me.webp', res => {
        res.on('data', () => {});
        res.on('end', () => {})
    }).end()
}
```

let's move on to our next example and that is the HTTP module, we have this sample code. This is using the HTTP module what this is gonna do is it's going to download my profile profile photo from my personal website I chose this because there is no CDN sitting in front of this, CDNs ends are great for performance because you know it can do lots of like caching, you can be downloading files closer to where you are geographically and you also decrease your bandwidth but they're not great for this test because CDNs make the timing unpredictable which is not good for benchmarks so we wanted to download something that was very very predictable so I chose this file so what we're doing here is we're downloading it we're listening to the data event to make sure that we're actually going to download all of the data and then we wait for the end event and we're timing from when we call HTTP request to the time the end event is fired so once again we are starting with four requests.

![http-4](../images/http-4.png)

It actually took almost the exact amount same amount of time to download that file four times which we want to see. It took about 250 milliseconds. Now we're gonna do the same thing which we did before and increase the number of requests to six.

![http-6](../images/http-6.png)

They also took about the exact same amount of time. It also took 250 milliseconds and it did not increase the amount of time it takes to download this file which is different than the results we saw in `crypto`. The reasons for this is, it has nothing to do with node, this is all just about like computer architecture and bottlenecks. Whenever we're downloading a file and especially in this case where we're downloading a file and only saving it to memory, we're not writing it to the hard drive, the limitation is the network itself like whenever we're downloading a file like this our computer is basically sitting there doing nothing most of the time and everyone time you get a little bit of data from the network which it'll take and go process so since we know we're not limited by the number of CPU cores because our CPUs sitting there doing nothing then we don't hit that bottle neck.

It turns out that it is actually not subjected to the limitations of the thread pool, the reasons for that is inside of NodeJS whenever possible it will actually use C++ asynchronous primitives under the hood. So it is actually possible to do asynchronous coding inside of C++ in certain cases. This is provided by the operating system itself so the way this works is, it looks a little different than JavaScript but it's roughly the same thing, the idea is that we tell the OS , we tell the kernel like _I want to go ahead and download this resource_ and then the kernel is actually going to manage downloading that code, it's happening in the kernel not inside of your application and then what we can do is we can actually ping the kernel and ask _hey are you done with this request yet?_ and eventually it's gonna say _yes_ once it's done we can then go and call some other methods that says _all right give me the results for this thing that I requested_. Now since this is a part of the kernel, we have to use a different mechanism for each different OS because they have different ways of doing this. On linux this method is called `epoll`, on Mac OS is it called `kqueue` and on windows this is called `GetQueuedCompletionStatusEX` and whenever we are making these asynchronous C++ calls because the operating system is doing it all for us we don't have to really do any code in C++, we don't have to assign it to a background thread and so whenever we're using this it's actually happening in the main thread itself and thus we're not limited to the number of threads in the thread pool.
