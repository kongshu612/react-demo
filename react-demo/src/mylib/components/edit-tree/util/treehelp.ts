import { EditDataNode } from "../interface";


export function travelTreeByLevel(rootNodes: EditDataNode[], payload: (node: EditDataNode) => void) {
    const queue = [...rootNodes];
    while (queue.length > 0) {
        let node = queue.shift();
        payload(node!);
        queue.push(...(node?.children || []));
    }
}

// find the array which item in
export function finditemArray(rootNodes: EditDataNode[], item: EditDataNode) {
    const queue = [rootNodes];
    while (queue.length > 0) {
        let node = queue.shift();
        if (node!.indexOf(item) >= 0) return node;
        for (let each of node!) {
            if (each.children && each.children.length > 0) {
                queue.push(each.children);
            }
        }
    }
    return [];
}