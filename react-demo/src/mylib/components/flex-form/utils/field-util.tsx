import { NamePath } from "antd/lib/form/interface";
import _ from "lodash";
import React from "react";
import FlexFieldItemWrapper from "../fields";
import FlexFieldItem from "../fields";
import { ConvertContext, FieldType, FlexFieldProps, IFlexTreeNode, MetaConfig } from "../interface";


export function fieldTypeResolver(value: any): FieldType {
    let t = typeof value;
    switch (t) {
        case 'string': return 'textbox';
        case 'number':
        case 'bigint': return 'inputnumber';
        case 'boolean': return 'switch';
    }
    return 'textbox';
}

const NAME_SPLIT = '__';

const ROOT_NAME = 'root';

export const serializesName = (name: NamePath) => {
    if (_.isArray(name)) {
        return name.join(NAME_SPLIT);
    } else {
        return `${name}`;
    }
}

export function convertToFlexFieldElements(dataObj: any, metas: MetaConfig[] = []): React.ReactElement {
    const rootNode = buildFlexTree(dataObj, metas);
    return (
        <>
            {rootNode.children?.map(it => <FlexFieldItemWrapper key={it.serializeName} {...it} />)}
        </>
    );
}


// used to construct the flexprops which will be used to construct field
// we target to determine the name, label, fieldtype of the field, and also, we will pass rules
// options, layout settings e.g. to the FieldProps from meta.
// if result returned from this function, it meas it need to render in DOM, otherwise, it is just a
// virtual node, no DOM render required.
const getFlexProps = (serializeName: string, name: NamePath, value?: any, meta?: MetaConfig): FlexFieldProps | undefined => {
    // if value is null, and meta is not null, use meta to construct the FlexFieldProps,
    // by defautl fieldType is textbox,
    if (value == null && !!meta) {
        return {fieldType:'textbox', ...meta } as FlexFieldProps;
    } 
    // if value is an object,return underfined if meta is null, otherwilse, use meta to render
    // if meta is null, it means current node is a virtual node, we don't need to render it in dom
    // it is just groupped by logic, e.g. {userInfo:{firstName:'San',lastName:'Zhang'}},by default 
    // userInfo don't need to render, we only need to render firstName, lastName, unless, we specify 
    // meta for userInfo emplicit.
    else if (_.isPlainObject(value)) {
        return !meta ? undefined : {fieldType:'textbox', ...meta } as FlexFieldProps;
    } 
    // if value is an array and (we specify from meta that value is a list, or the items in the array is an 
    //  object), for this branch, it meas each item of the array is a subtree.
    else if (_.isArray(value) && (meta?.isList || (value.length > 0 && _.isPlainObject(value[0])))) {
        const label = meta?.label || `${_.last(_.toArray(name))}`;
        return {
            name,
            label,
            ...(meta || {}),
            isList: true,
        }
    }
    // by default case, we will determine the fieldType by value type, like number->inputnumber, bool -> switch
    // others text.
    else {
        const fieldType = fieldTypeResolver(value);
        const label = meta?.label || `${_.last(_.toArray(name))}`;
        return {
            name,
            label,
            fieldType,
            ...(meta || {})
        };
    }
}


// consturct a tree under the specified parent, tree is mapped both from dataObject and metas.
// every node of the Object or metas must have a node in the tree, but not every node need to render in DOM
// the condition is if the data prop of the tree node exist, data prop will contain all necessery info
// to render Field.
const convertToNodes = (parent: IFlexTreeNode, dataObj: any, visitedNode: Map<string, IFlexTreeNode>, metasMap: { [k: string]: MetaConfig }) => {
    const { serializeName: prefixName, name: prefixNamePath } = parent;
    for (let [key, value] of Object.entries(dataObj)) {
        // construct the serializedName and namePath
        let serializeName = prefixName === ROOT_NAME ? key : `${prefixName}${NAME_SPLIT}${key}`;
        let meta = metasMap[serializeName];
        if (meta) {
            delete metasMap[serializeName];
        }
        let name = [..._.toArray(prefixNamePath), key] as NamePath;
        let node: IFlexTreeNode = { serializeName, children: [], name };
        // insert current node to the children of parent
        parent.children?.push(node);
        visitedNode.set(serializeName, node);
        // construct the data props, which will be used to render field if not empty
        node.data = getFlexProps(serializeName, name, value, meta);
        // if the child value is an object we just call the function iterate
        if (_.isPlainObject(value) && value != null) {
            convertToNodes(node, value, visitedNode, metasMap);
        } 
        // if the child Fields are list, we call the builFlexTree, as for list, we treat it as a sub tree.
        else if (node.data?.isList) {
            let children = [];
            let maxlen = meta.arrayChildren?.length || 1;
            for (let i = 0; i < maxlen; i++) {
                let childTreeRootNode = buildFlexTree(i === 0&&value!=null ? (value as any)[0]||{} : {}, meta?.arrayChildren?.[i] || [], true);
                childTreeRootNode.data = {
                    isGroup: true,
                    name: [],
                    label: '',
                }
                if (childTreeRootNode.children!.length > 0) {
                    children.push(childTreeRootNode);
                }
            }
            node.children = children;
        }
    }
}

// Tree-Shake, we only keep treenode if it has data, for others we just ignore
// we only check the first level of items which have data props, it may contains data in the 
// second/third, or more level, we will do it later.
function consolidateTreeNode(node: IFlexTreeNode): IFlexTreeNode[] {
    let result = [];
    if (!!node.data) {
        result.push(node!);
        return result;
    }
    if (!node.children?.length) {
        return [];
    }
    for (let child of node.children) {
        result.push(...consolidateTreeNode(child));
    }
    return result;
}

//遍历树，去除一些辅助节点，也就是没有Item 的节点。或者没有children 的节点，留下的节点，都是要渲染的。
function consolidateFlexTree(root: IFlexTreeNode): IFlexTreeNode {
    let queue: IFlexTreeNode[] = [];
    queue.push(root);
    while (queue.length > 0) {
        let node = queue.shift() as IFlexTreeNode;
        if (!node.children?.length) { continue; }
        let children: IFlexTreeNode[] = [];
        // it meas every child will be render in DOM as Field
        node.children?.forEach(child => {
            children.push(...consolidateTreeNode(child));
        });
        node.children = children;
        queue.push(...children);
    }
    return root;
}


// This is the main funciton to construct the Render Tree
function buildFlexTree(dataObj: any, metas: MetaConfig[], skipSort?: boolean): IFlexTreeNode {
    let treeNode: Map<string, IFlexTreeNode> = new Map<string, IFlexTreeNode>();
    let metasObj: { [k: string]: MetaConfig } = {};
    // transfer metas array into a meta map, key is the serialize name of meta, value is meta
    for (let meta of metas) {
        let name = serializesName(meta.name!);
        metasObj[name] = meta;
    }
    // This is the root node
    let root: IFlexTreeNode = {
        serializeName: ROOT_NAME,
        children: [],
        name: [],
    }

    convertToNodes(root, dataObj, treeNode, metasObj);
   
    for (let [key, meta] of Object.entries(metasObj)) {
        const name = _.toArray(meta.name);
        let parent = root;
        for (let i = 0; i < name.length; i++) {
            let serializeName = serializesName(name.slice(0, 1 + i));
            if (!treeNode.has(serializeName)) {
                let node: IFlexTreeNode = {
                    serializeName,
                    children: [],
                    name: name.slice(0, 1 + i),
                    data: meta.isGroup ? undefined : { ...meta } as any,
                }
                parent.children?.push(node);
                parent = node;
            } else {
                parent = treeNode.get(serializeName)!;
            }
        }
    }

    consolidateFlexTree(root);
    // if (!skipSort) {
    //     sortTree(root);
    // }

    return root;
}

function sortTree(root: IFlexTreeNode) {
    let queue: IFlexTreeNode[] = [];
    queue.push(root);
    while (queue.length > 0) {
        let node = queue.shift()!;
        if (node.children && node.children.length > 0) {
            node.children = node.children.sort((a, b) => {
                if (!a.children || a.children.length == 0) {
                    return (!b.children || b.children.length == 0) ? a.serializeName.localeCompare(b.serializeName) : -1;
                } else if (!b.children || b.children.length == 0) {
                    return 1;
                } else {
                    return a.serializeName.localeCompare(b.serializeName);
                }
            });
            queue.push(...node.children);
        }
    }
}

