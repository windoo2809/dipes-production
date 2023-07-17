import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {

    const { field, changeTrigger, related, table, defaultValue, selectOption, onEmailError, readOnly } = props;

    const [current, setCurrent] = useState(defaultValue ? defaultValue : "")
    const [fields, setFields] = useState([])
    const [height, setHeight] = useState(0)
    const [foreignData, setForeignData] = useState([])
    const [showKey, setShowKey] = useState("")
    const { proxy, unique_string } = useSelector(state => state);
    const [relatedTable, setRelatedTable] = useState({})
    const [pk, setPK] = useState("");


    const [emailError, setEmailError] = useState(false);
    const validateEmail = (email) => {
        const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return emailRegex.test(email);
    };


    const fieldChangeData = (e) => {
        const { value } = e.target;
        setCurrent(value);
        const isValidEmail = validateEmail(value) || value === '';
        onEmailError(!isValidEmail);
        if (isValidEmail) {
            changeTrigger(field, value);
            setEmailError(false);
        }
        else {
            setEmailError(true);
        }
    };
    const changeRawData = (e) => {
        const { value } = e.target;
        setCurrent(value);
        const isValidEmail = validateEmail(value) || value === '';
        onEmailError(!isValidEmail);
        if (isValidEmail) {
            changeTrigger(field, value);
            setEmailError(false);
        }
        else {
            setEmailError(true);
        }
    }

    useEffect(() => {
        if (defaultValue !== undefined) {
            const key = isFieldForeign()
            if (key) {
                // fetch(`${proxy()}/apis/apis/table/data/${table_alias}`).then(res => res.json()).then(res => {/table/:table_id/data
                fetch(`${proxy()}/apis/table/${key.table_id}/data`).then(res => res.json()).then(res => {
                    const { success, data, fields } = res.data;
                    // console.log(res.data)
                    setForeignData(data)
                    setFields(fields)

                    const { ref_field_id } = key;
                    const primaryField = fields.find(field => field.id == ref_field_id);
                    if (primaryField) {
                        setPK(primaryField.fomular_alias)
                    }
                })

            } else {
                setCurrent(defaultValue)
            }
        } else {

            if (!isFieldForeign()) {

            } else {

                const key = isFieldForeign()
                if (key) {
                    if (foreignData.length == 0) {
                        fetch(`${proxy()}/apis/table/${key.table_id}/data`).then(res => res.json()).then(res => {
                            const { success, data, fields } = res;
                            // console.log(data)
                            setForeignData(data.data)
                            setFields(data.fields)

                            const { ref_field_id } = key;
                            const primaryField = data.fields.find(field => field.id == ref_field_id);
                            if (primaryField) {
                                setPK(primaryField.fomular_alias)
                            }
                        })
                    }
                }

            }
        }
    }, [defaultValue]);

    const isFieldForeign = () => {
        // console.log(table)
        // console.log(field)
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


    if (isPrimaryKey()) {

        if (!isFieldForeign()) {

            return (
                <div class="row justify-content-center">
                    <div class="col-md-6">
                        <form>
                            <div class="form-group">
                                <label for="name">{field.field_name}{!field.NULL && <span style={{ color: 'red' }}> *</span>}</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder=""
                                    onChange={changeRawData}
                                    defaultValue={defaultValue == undefined ? current : defaultValue}
                                    readOnly={readOnly ? true : false}
                                />
                                <div className="rel">
                                    <div className="abs">
                                        {emailError && (
                                            <span className="block text-red text-14-px mb-2" style={{color: 'red'}}>
                                                Địa chỉ email không hợp lệ
                                            </span>
                                        )}
                                    </div>
                                </div>
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
                        {emailError && (
                            <div className="rel">
                                <div className="abs">
                                    <span className="block crimson p-0-5 text-14-px mb-2" style={{color: 'red'}}>
                                        Email không hợp lệ
                                    </span>
                                </div>
                            </div>
                        )}
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
                                    type="text"
                                    className="form-control"
                                    placeholder=""
                                    onChange={changeRawData}
                                    value={current}
                                    readOnly={readOnly ? true : false}
                                />

                            </div>
                        </form>
                        {emailError && (
                            <div className="rel">
                                <div className="abs">
                                    <span className="block crimson p-0-5 text-14-px mb-2" style={{color: 'red'}}>
                                        Email không hợp lệ
                                    </span>
                                </div>
                            </div>
                        )}
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
                                {emailError && (
                                    <div className="rel">
                                        <div className="abs">
                                            <span className="block crimson p-0-5 text-14-px mb-2" style={{color: 'red'}}>
                                                Email không hợp lệ
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </form>
                    </div>
                </div>
            )
        }

    };

};
