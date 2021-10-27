import React from 'react';
import { MetaConfig } from '../mylib/components/flex-form/interface';
import FlexForm from '../mylib/components/flex-form/flex-form.component';

interface UserTypeDemo {
    name: string;
    age: number;
    isBoy: boolean;
    [k: string]: any;
}
const BasicDemo = () => {
    const metas: MetaConfig[] = [
        {
            name: 'name',
            label: 'User Full Name',
            rules: [{ required: true, }]
        },
        {
            name: 'age',
            label: 'Age',
            rules: [{ required: true }, { type: 'number', min: 0, max: 99 }],
            fieldType: 'inputnumber',
        },
        {
            name: 'gender',
            label: 'Gender',
            rules: [{ required: true }],
            fieldType: 'radiobox',
            options$: Promise.resolve([{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Other', value: 'other' }]),
        },
        {
            name: 'favirateFoods',
            label: 'Favoriate Food',
            fieldType: 'select',
            options$: Promise.resolve(['apple', 'pear', 'banana', 'peach', 'orange'].map(it => ({ label: it, value: it }))),
        },
        {
            name: 'agree',
            label: 'Agree',
        },
        {
            name: 'book',
            label: 'Favoriate Books',
            fieldType: 'select',
            options$: Promise.resolve(['book1', 'book2', 'book3']),
            rules: [{ required: true }],
            allowClear: true,
        }
    ];
    const [val, setVal] = React.useState<any>(
        { name: 'user1', age: 20, gender: 'male', favirateFoods: ['apple', 'pear'], agree: true }
    );
    return (
        <div className="each-example">
            <h2>This is basic Demo for Form from object</h2>
            <span>Serialize User is {JSON.stringify(val)}</span>
            <FlexForm initializeValue={val} 
            metas={metas} 
            onChange={values => setVal(values as UserTypeDemo)}></FlexForm>
        </div>
    )
}

const BasicFlexForm:React.FC=()=>{
    return (
        <>
        <BasicDemo/>
        </>
    )
}

export default BasicFlexForm;