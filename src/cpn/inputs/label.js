import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default (props) => {

    const { field, changeTrigger, related, table, defaultValue, selectOption } = props;
    const [current, setCurrent] = useState('')

// console.log(field)

   
    useEffect(() => {
        setCurrent(defaultValue)
    }, [defaultValue])
    return (
        <div class="row justify-content-center">
            <div class="form-group col-md-6">
                <form>
                    <div class="form-group">
                        <label className='font-weight-bold' for="name">{field.field_name}:</label> <br></br>
                        <p>{current}</p>
                    </div>
                </form>
            </div>
        </div>
    )
}