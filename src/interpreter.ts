import { always, cond, equals } from 'ramda';

const ops = {
    ADD: "+",
    SUB: "-",
    MUL: "*",
    DIV: "/",
    GT: ">",
    LT: "<",
    EQL: "==",
    TripleEQL: "===",
    GTE: ">=",
    LTE: "<="
};
let globalScope = new Map();
let value: any;

const visitVariableDeclaration = (node: any) => {
    const nodeKind = node.kind;
    return visitNodes(node.declarations, nodeKind);
}

const visitVariableDeclarator = (node:any, nodeKind: string) => {
    const id = node.id && node.id.name;
    const init:any = visitNode(node.init);
    if (nodeKind === "let" || nodeKind === "const" || nodeKind === "var") {
      if (globalScope.has(id)) {
        value = `Uncaught SyntaxError: Identifier '${id}' has already been declared`;
      } else {
        globalScope.set(id, init);
      }
    } else {
      globalScope.set(id, init);
    }

    return init;
}
  
const visitLiteral = (node:any) => {
    return node.raw;
}

const visitIdentifier = (node:any) => {
    const name = node.name;
    return globalScope.get(name)
        ? globalScope.get(name)
        : (value = ` Uncaught ReferenceError: '${name}' is not defined `);
}

const visitBinaryExpression = (node: any) => {
    const leftNode:any = isNaN(visitNode(node.left))
        ? visitNode(node.left)
        : +visitNode(node.left);
    const operator = node.operator;
    const rightNode:any = isNaN(visitNode(node.right))
        ? visitNode(node.right)
        : +visitNode(node.right);
    const result = cond([
        [equals(ops.ADD), always(leftNode + rightNode)],
        [equals(ops.SUB), always(leftNode - rightNode)],
        [equals(ops.DIV), always(leftNode / rightNode)],
        [equals(ops.MUL), always(leftNode * rightNode)],
        [equals(ops.GT), always(leftNode > rightNode)],
        [equals(ops.LT), always(leftNode < rightNode)],
        [equals(ops.EQL), always(leftNode == rightNode)],
        [equals(ops.TripleEQL), always(leftNode === rightNode)],
        [equals(ops.LTE), always(leftNode <= rightNode)],
        [equals(ops.GTE), always(leftNode >= rightNode)]
    ]);
    return result(operator);
}

const evalArgs = (nodeArgs: string) => {
    let g = [];
    for (const nodeArg of nodeArgs) {
      g.push(visitNode(nodeArg));
    }
    return g;
}

const visitCallExpression = (node:any) => {
    const _arguments = evalArgs(node.arguments);
    value = _arguments;
    if (node.callee.type == "MemberExpression") {
      const callee = node.callee;
      if (node.callee.property.name == "log") {
        return value;
      }
    }
    if (node.callee.type == "Identifier" && node.callee.name == "alert") {
      alert(value);
      return value;
    }
}

const visitExpressionStatement = (node:any) => {
    return visitCallExpression(node.expression);
}

const visitNodes = (nodes:any, nodeKind = "") => {
    for (const node of nodes) {
        const nodeType = node.type;
        visitNode(node, nodeKind);
    }
}

const visitNode = cond([
    [(node) => node.type =='VariableDeclaration', (node) => visitVariableDeclaration(node)],
    [(node) => node.type =='VariableDeclarator', (node, nodeKind) =>visitVariableDeclarator(node, nodeKind)],
    [(node) => node.type =='Literal', (node) =>visitLiteral(node)],
    [(node) => node.type =='Identifier', (node) =>visitIdentifier(node)],
    [(node) => node.type =='BinaryExpression', (node) =>visitBinaryExpression(node)],
    [(node) => node.type =='CallExpression', (node) =>visitCallExpression(node)],
    [(node) => node.type =='ExpressionStatement', (node) =>visitExpressionStatement(node)],
    [always(true), always(null)]
]);

export function getValue() {
    return value;
}


export const run = (nodes:any) => {
    value="";
    return visitNodes(nodes);
}

  
