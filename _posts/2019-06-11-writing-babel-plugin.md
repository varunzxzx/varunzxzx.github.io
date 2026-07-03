---
title: "Writing My First Babel Plugin"
date: 2019-06-11
tags: [babel, react, css]
description: "Understanding how Babel transforms work by building a plugin that extracts static CSS at build time."
---

![Babel](/assets/img/babel.jpeg)

Before digging into Babel plugin, Let’s understand Babel and How It Works? Babel is a transpiler which converts your ES20XX, JSX and such code to ES2015 for better browser compatibility. As new APIs are introduced frequently and the language standards keeps updating, Browsers doesn’t updates itself at such pace. Here Babel comes to the rescue. It allows developers to use modern language features without worrying about the browser compatibility.

You have been using Babel , If you ever built a React app. React uses JSX which is not a standard Javascript syntax. It is Babel which converts all your wonderful JSX to something which browsers can understand. Babel is not limited to only JSX or React. It supports all modern APIs like async/await.

## How It Works?

Babel goes through 3 major stages in order to perform this magic:

1. Parse
2. Transform
3. Generate

#### Parse

The parse stage, takes code and outputs an Abstract Syntax Tree or AST.

> “an **abstract syntax tree (AST)**, or just **syntax tree**, is a tree representation of the abstract syntactic structure of source code” - Wikipedia

For example:

```javascript
function square(n) {
  return n * n;
}
```

The AST representation of the above program looks like this:

```md
- FunctionDeclaration:
  - id:
    - Identifier:
      - name: square
  - params [1]
    - Identifier
      - name: n
  - body:
    - BlockStatement
      - body [1]
        - ReturnStatement
          - argument
            - BinaryExpression
              - operator: *
              - left
                - Identifier
                  - name: n
              - right
                - Identifier
                  - name: n
```

Or as a JavaScript Object like this:

```javascript
{
  type: "FunctionDeclaration",
  id: {
    type: "Identifier",
    name: "square"
  },
  params: [{
    type: "Identifier",
    name: "n"
  }],
  body: {
    type: "BlockStatement",
    body: [{
      type: "ReturnStatement",
      argument: {
        type: "BinaryExpression",
        operator: "*",
        left: {
          type: "Identifier",
          name: "n"
        },
        right: {
          type: "Identifier",
          name: "n"
        }
      }
    }]
  }
}
```

> Note: Some properties have been removed for simplicity.

#### Transform

The transform stage takes an AST and traverses through it, adding, updating, and removing nodes as it goes along. This is where Babel plugins operate. We’ll come back to this section later.

#### Generate

The code generation stage takes the final AST and turns it back into a string of code.

## Babel Plugin

Now when we know how babel operates, let’s dig deep into babel plugins. Babel plugins allows the developers to transform their code anyhow they want. Babel abstracts the complex operations of parsing and generating the code and exposes a set of magical APIs to transform the code as we want. We’ll use these APIs to build our plugin.

As you already know now, that Babel plugins operates in the **transform** stage. In this stage, we get an object like representation of the code. So, we just need to manipulate that object to change the code.

Let’s start writing our babel plugin. So, there is a tiny css-in-js library called [use-css](https://github.com/siddharthkp/use-css#readme) by [siddharthkp](https://twitter.com/siddharthkp). Here is a small demo of it:

```jsx
import useCSS from 'use-css';

function Oopsy(props) {
  const className = useCSS(`
    font-size: 21px;
    font-style: italic;
    color: ${props.color};
    &:hover {
      font-weight: bold;
    }
  `);

  return <div className={className}>because why not?</div>;
}

render(<Oopsy color="green" />);
```

We’ll create a babel plugin which extracts all the css and puts it in static file because why not :P
Now, comes the question how will you handle dynamic values like one in the above example. Well I’ve a magic spell for it as well XD.

Our plugins begins with a function which receives the current babel instance as an argument.

```javascript
export default function(babel) {
  // plugin contents
}
```

Then we return an object with a property visitor

```javascript
export default function(babel) {
  return {
    visitor: {
      // visitor contents
    },
  };
}
```

Now, what is a **visitor**? In the transform stage(where our plugin operates), babel traverse through the tree means it will visit each node. **Visitor** is an object with some methods which will be invoked by babel once the particular type of node is found. You can see in the object representation of AST above, every node has certain type. We’ll be using this information to build our visitor.
It’ll be more clear by the following example:

```javascript
const MyVisitor = {
  Identifier() {
    console.log('Called!');
  },
};
```

Now, the Identifier method will be called every time babel visits a node of type “Identifier”. These visitor methods receives path of the node as argument. To know about different types of node, you can use [AST explorer](https://astexplorer.net/). This is going to be your most used resource while building a babel plugin. To manipulate any object you should know the structure of the object. You can view the AST representation of any code with this tool which is very handy.

For our plugin we need to get all the “useCSS” call because then we’ll be able to get all the styles, and put it in a static style. Then, we will replace the function call with a class name and remove all imports. So the following code

```jsx
import useCSS from 'use-css';

function Oopsy(props) {
  const className = useCSS(`
    font-size: 21px;
    font-style: italic;
    &:hover {
      font-weight: bold;
    }
  `);

  return <div className={className}>because why not?</div>;
}

render(<Oopsy color="green" />);
```

will be transformed to

```jsx
function Oopsy(props) {
  const className = “4vg68s”

  return <div className={className}>because why not?</div>
}

render(<Oopsy color="green" />)
```

and all the styles will be moved to bundle.css. For the dynamic values, we’ll be using css variables(magic spell). For example:

```jsx
import useCSS from 'use-css';

function Oopsy(props) {
  const className = useCSS(`
    font-size: 21px;
    font-style: italic;
    color: ${props.color};
    &:hover {
      font-weight: bold;
    }
  `);

  return <div className={className}>because why not?</div>;
}

render(<Oopsy color="green" />);
```

will be transformed to:

{% raw %}
```jsx
/* js */
function Oopsy(props) {
  const className = “4vg68s”

  return (
  <div className={className} style={{“--sj55zd”: props.color}}>
    because why not?
  </div>
  )
}

render(<Oopsy color="green" />)
```
{% endraw %}
```css
/* bundle.css */
.4vg68s{
font-size:21px;
font-style:italic;
color:var(--sj55zd);
}
.4vg68s:hover {
font-weight:bold;
}
```

To get all the “useCSS” function call we will simply do this:

```javascript
export default function(babel) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name !== 'useCSS') return;
        // do the thing
      },
    },
  };
}
```

**CallExpression** is the node type which we need and the **callee** property of that node gives us the function name. Again, I used AST Explorer to find all the properties of the node.
Now, we need the template literal(styles) passed to the function. For that we are going to traverse its child nodes and get the styles.

```javascript
export default function(babel) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name !== 'useCSS') return;
        path.traverse({
          // nested visitor
        });
      },
    },
  };
}
```

“traverse” method is used to traverse child nodes of a node. It takes a “visitor” object. Now, In this visitor we only need the template literal. So,

```javascript
export default function(babel) {
  return {
    visitor: {
      CallExpression(path) {
        if (path.node.callee.name !== 'useCSS') return;
        path.traverse({
          TemplateLiteral(path) {
            // do the thing
          },
        });
      },
    },
  };
}
```

Now, template literals have two main properties that we’ll be using, “quasis” and “expressions”. Both these properties are an array. “quasis” contains the string part of the string literal and “expressions” contains the variables used in the string literal. For example the following code:

```javascript
`I love ${theThing} and ${anotherThing}`;
```

will be represented as:

```javascript
{
  “type”: “TemplateLiteral”,
  “quasis”: [“I love”, “and”],
  “expressions: [“theThing”, “anotherThing”],
  ...
}
```

> Note: The values are not stored as array of strings but array of nodes. But, we can get these values from the nodes.

What if we don’t have any variable in the string literal. Then the “expressions” will be empty and “quasis” will only have one node(whole string).
Let’s write the code to merge these values to get the style

```javascript
TemplateLiteral(path) {
  const templateLiteral = path.node; //get the node
  const quasis = [...templateLiteral.quasis]; //get the quasis
  let staticStyle = “”;

  // check whether it includes variables or not
  if (quasis.length !== 1) {
   quasis.map((el, i) => {
    // the last quasis is marked as tail in AST
    if (!el.tail) {
      const expr = templateLiteral.expressions[i];
      // check whether the value is an object’s property
      // or a normal variable(babel’s api, more on it later)
      if (t.isMemberExpression(expr)) {
        value = `${expr.object.name}.${expr.property.name}`;
      } else {
        value = expr.name;
      }
      // We are going to use this ‘value’ variable later on.
      // It stores the name of the variable.
    }
    staticStyle += el.value.cooked;
   });
 } else {
    staticStyle = quasis[0].value.cooked;
 }
}
```

> Note: I am not going to describe all the properties of the nodes. [AST Explorer](http://astexplorer.net) is the best 😄

The above code gets all the string parts(quasis) and store it to the variable **staticStyle**. I’ve only showed how to get the variables but we are not using it yet. Now, if you notice, I am getting the value from **expressions** when the quasis tail(property of that node) is falsy. Because the tail quasis represents the end of the string(there is no variable after it).

Now, we need to do two things to handle dynamic values.

1. Generate a random css variable(It must be unique)
2. Add that variable to the style attribute in the JSX

We are going to use the same hash library used by use-css to create unique css variables. The second step is little complex. We need to add the css variable and its value to the JSX which needs that dynamic style. But, How to find that JSX?

The only way to find the required JSX is to find the variable which is defined in usercode. If you look at the demo of the use-css above. The **useCSS** function returns the class name and the user stores it in a variable and uses it in the JSX. We are going to trace this variable to get to the JSX.
Now, comes another issue. We are in the useCSS function call visitor in our plugin. So, how to reach the JSX which resides somewhere else, within the same visitor. Well it is not possible. So, we’ll store the required information somewhere and make a new visitor for JSX and will use the stored information to manipulate the JSX.

What is the information we are going to store. We need three values for this

1. The variable in the usercode(to find the JSX)
2. The css variable which we generated
3. The value our css variable holds

Let’s write the code for it

```js
import hash from "@emotion/hash";
const styles = {};

TemplateLiteral(path) {
    ...
    const identifier = path.parentPath.parentPath.node.id.name;

    ...
    // generating unique css variable name
    cssVarName = hash(value);

    // adding it to the style
    el.value.cooked += `var(--${cssVarName})`;

    // add the css variabe name with its value to
    // the styles obj(dynamic styles)
    styles[identifier] = [cssVarName, value];

    ...
}
```

Babel provides the parent path of the node so I used it to get to the user code variable. Also, I am storing the usercode variable as keys in the **styles** object because it will be used to find the JSX. Now, we can find the required JSX. Let’s jump into the code:

```js
export default function(babel) {
  const t = babel.types;
  return {
    visitor: {
      …,
      JSXAttribute(path) {
        if (path.node.value.type !== "JSXExpressionContainer") return;
        if (!styles[path.node.value.expression.name]) return;
        const identifier = path.node.value.expression.name;
        // add style attribute to JSX for dynamic styles
        path.parentPath.node.attributes.push(
          t.JSXAttribute(
            t.JSXIdentifier("style"),
            t.JSXExpressionContainer(
              t.ObjectExpression([
                t.ObjectProperty(
                  t.StringLiteral(`--${styles[identifier][0]}`),
                  t.Identifier(styles[identifier][1])
                )
              ])
            )
          )
        );
      }
    }
  };
}
```

That’s a lot of code. Let’s break it down. So, I am searching for the **JSXAttribute** and the first “if” early exits the function if the attributes value is not a user defined variable. Now, the second “if” checks whether we have something to modify in that node. We do this by simply checking whether we have any entry for that user defined variable in our styles object. Because we don’t need to alter the JSX which is not using any dynamic styles.

Once we pass these tests, we start altering the node. Now, here we are doing something little different. Earlier, we get some information from the node but now we have to build a node i.e. the JSX style attribute.
As I said, Babel provides some magical APIs to make our life a lot easier. We can do this using the builder methods from “babel.types”. We also used one helper function before as well from “babel.types” when we are extracting styles from the string literal. The method name for a builder is simply the name of the node type you want to build except with the first letter lowercased. For example if you wanted to build a MemberExpression(node type) you would use

```js
const t = babel.types;
t.memberExpression(...)
```

The arguments of these builders are decided by the node definition, they can all be found here.
A node definition looks like the following:

```js
defineType("MemberExpression", {
  builder: ["object", "property", "computed"],
  visitor: ["object", "property"],
  aliases: ["Expression", "LVal"],
  ...
});
```

By looking at the **builder** property, you can see the 3 arguments that will be needed to call the builder method (t.memberExpression).
This looks pretty simple for **MemberExpression**. But, here we are building a JSX Attribute. I want you to explore how this attribute is built(Use [node definitions](https://github.com/babel/babel/tree/master/packages/babel-types/src/definitions) and [AST Explorer](http://astexplorer.net) for reference)

We forgot to save our styles to a css file. Let’s do it now.

```js
import { writeFile } from "fs";

export default function(babel) {
  return {
    visitor: {
        ...
        } else {
          staticStyle = quasis[0].value.cooked;
        }
        writeFile("bundle.css", staticStyle, function(err) {
          if (err) throw err;
        });
    }
  };
}
```

This will generate put all the static styles to **bundle.css**. But, the library also accepts scss like syntax and the styles doesn’t includes any class name yet. So, we have to pre-process it as well. We are going to use the same pre-processor used by use-css and the same hashing library to generate classnames.

```js
function getClassName(styles) {
  return "c" + hash(styles);
}
export default function(babel) {
  return {
    visitor: {
        ...
        } else {
          staticStyle = quasis[0].value.cooked;
        }
        // convert string literal into string
        const finalStaticStyle = staticStyle.replace(/\r?\n|\r|\s/g, "");

        className = getClassName(finalStaticStyle);

        const rawCSS = stylis("." + className, finalStaticStyle);

        writeFile("bundle.css", rawCSS, function(err) {
          if (err) throw err;
        });
    }
  };
}
```


Now our babel plugins saves all the css to a static file while managing the dynamic styles as well. So, if we have done all this job during the build time. Why to repeat pre-processing, hashing etc. in the runtime. We need to remove all the useCSS calls and replace it with the classname which we’ve generated.
To do this I’ll simply use the helper method provided by babel. You can find all the babel helper functions [here](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md).

```js
path.replaceWith(t.StringLiteral(className));
```

We are done with 99.9% of the work. We’ve to remove the use-css imports as well. I got tired writing this blog post 😅. So, I handover this task to you ✌️.
The complete plugin can be found [here](https://github.com/varunzxzx/babel-plugin-use-css).

By building babel plugin, you feel like you’ve unlocked some new skills. The community has built various cool things like codemods and stuff. The only thing you need to do is to love ASTs 😉.

I used [babel-plugin handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) and [AST Explorer](https://astexplorer.net) as a reference while building this plugin. You can’t get better resources than these two. I highly suggest you to read the handbook, it includes all the APIs which you need to build the plugin.

Kindly ping me [@varunzxzx](https://twitter.com/varunzxzx) if you build something amazing. I’ll be super happy if my post inspires someone.
