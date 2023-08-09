import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {
    const { field, changeTrigger, related, table, defaultValue, selectOption } = props;

    const [current, setCurrent] = useState(defaultValue ? defaultValue : "")
    const [fields, setFields] = useState([])
    const [height, setHeight] = useState(0)
    const [foreignData, setForeignData] = useState([])
    const [showKey, setShowKey] = useState("")
    const { proxy, unique_string } = useSelector(state => state);
    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState("");
    // console.log(table)
    // console.log("data field",field.id)

    useEffect(() => {
        if (defaultValue !== undefined) {
            const key = isFieldForeign()
            if (key) {

                // fetch(`${proxy()}/apis/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {/table/:table_id/data
                const dataBody = {
                    table_id: 41,
                    start_index: 0,
                    criteria: {
                    }
                }
                console.log(dataBody)
                fetch(`${proxy()}/api/foreign/data`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",

                    },
                    body: JSON.stringify(dataBody)

                }).then(res => res.json()).then(res => {
                    const { success, data, fields,  sumerize, statistic } = res;
                    console.log(res)
                    setCurrent(data)
                    changeTrigger(field, data)
                })

            } else {
                setCurrent(defaultValue)
            }
        } else {
            if (!isFieldForeign() && field.AUTO_INCREMENT) {
                fetch(`${proxy()}/apis/field/autoid/${field.id}`)
                    .then(res => res.json()).then(res => {
                        const { data } = res;
                        // console.log(data.id)
                        setCurrent(data.id)
                        changeTrigger(field, data.id)
                    })
            } else {
                const key = isFieldForeign()
                if (key) {
                    if (foreignData.length == 0) {
                        const dataBody = {
                            table_id: 41,
                            start_index: 1,
                            criteria: {
        
                            }
                        }
                        console.log(dataBody)
                        fetch(`${proxy()}/api/foreign/data`, {
                            method: "POST",
                            headers: {
                                "content-type": "application/json",

                            },
                            body: JSON.stringify(dataBody)

                        }).then(res => res.json())
                            .then(res => {
                                const { success, data, fields,  sumerize, statistic } = res;
                               
                                setForeignData(data)
                                setFields(fields)
 
                            const { ref_field_id } = key;
                                console.log(key)
                                const primaryField = fields.find(field => field.id == ref_field_id);
                                console.log(primaryField)
                                if (primaryField) {
                                    setPK(primaryField.fomular_alias)
                                }
                            })
                    }
                }

            }
        }
    }, [defaultValue])

    useEffect(() => {

    }, [])

    const isFieldForeign = () => {
        if (table) {
            const { foreign_keys } = table;
            const key = foreign_keys.find(key => key.field_id == field.id)
            if (key) {
                return key
            }
        }
        return false
    }

    const isPrimaryKey = () => {
        if (table) {
            const { primary_key } = table;
            const key = primary_key.find(key => key == field.id)
            if (key) {
                return key
            }
        }
        return false
    }

    const fieldChangeData = (e) => {
        const rawJSON = e.target.value
        const value = JSON.parse(rawJSON)

        setCurrent(value[pk])
        changeTrigger(field, value[pk])
    }

    const changeRawData = (e) => {
        const { value } = e.target
        setCurrent(value)
        changeTrigger(field, value)
    }

    const focusTrigger = () => {
        setHeight(250);
    }
    const generateData = (data) => {

        // if( fields.length > 0 && data ){
        //     let showFields = fields;
        //     const { display_fields } = relatedTable;

        //     if( display_fields && display_fields.length > 0 ){
        //         showFields = display_fields;
        //         return showFields.map( f => data[f] ).join(' - ')
        //     }
        //     return showFields.map( f => data[ f.field_alias ] ).join(' - ')

        // }else{
        //     return null
        // }c        
        if (data) {
            return data[pk]
        }
        return null
    }

    // const dataClickedTrigger = (data) => {
    //     setCurrent(data);
    //     changeTrigger(field, data[pk])
    // }

    if (isPrimaryKey()) {

        if (!isFieldForeign()) {

            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <input
                                    type={field.AUTO_INCREMENT ? "text" : "number"}
                                    className="form-control"
                                    placeholder=""
                                    onChange={changeRawData}
                                    defaultValue={defaultValue == undefined ? current : defaultValue}
                                    readOnly={field.AUTO_INCREMENT ? true : false}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )
        }
        else {
            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <select className="form-control" name="role" onChange={fieldChangeData} value={generateData(current)}>
                                    {selectOption ? (
                                        <option value={""} >Chọn</option>
                                    ) : null
                                    }

                                    {foreignData && foreignData.length > 0 && foreignData.map((d, index) =>
                                        <option value={JSON.stringify(d)} selected={d[pk] == defaultValue ? true : false} >
                                            <div key={index} className="form-control" >
                                                <span>{generateData(d)}</span>
                                            </div>
                                        </option>
                                    )}
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }

    } else {

        if (!isFieldForeign()) {
            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <input
                                    type={field.AUTO_INCREMENT ? "text" : "number"}
                                    className="form-control"
                                    placeholder=""
                                    onChange={changeRawData}
                                    value={current}
                                    // readOnly={field.AUTO_INCREMENT ? true : false}
                                />

                            </div>
                        </form>
                    </div>
                </div>
            )
        } else {
            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <select className="form-control" name="role" onChange={fieldChangeData} value={generateData(current)}>
                                    {selectOption ? (
                                        <option value={""} >Chọn</option>
                                    ) : null
                                    }
                                    {foreignData && foreignData.length > 0 && foreignData.map((d, index) =>
                                        <option value={JSON.stringify(d)} selected={d[pk] == defaultValue ? true : false} >
                                            <div key={index} className="form-control" >
                                                <span>{generateData(d)}</span>
                                            </div>
                                        </option>
                                    )}
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
            )
        }
    }

}