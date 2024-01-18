import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquarePlus, faFileImport, faFileExport, faMagnifyingGlass, faDownload } from '@fortawesome/free-solid-svg-icons';
const RenderComponent = ({ component, apiData, redirectToInput, redirectToInputPUT, handleDelete, handleSearchClick, exportToCSV, handleViewDetail, exportFile, redirectToImportData }) => {
    console.log(123456, apiData)
    const { lang, proxy, auth, functions } = useSelector(state => state);

    // Hàm chính để xác định loại component cần render
    const renderByType = (type, props, flex, id) => {
        console.log(123, props);
        // //console.log(123,type);
        // //console.log(123,flex);
        // //console.log(123,id);
        // Hàm kiểm tra xem đối tượng flex có dữ liệu không
        const hasFlexData = (flex) => {
            return flex && flex.props && flex.props.style;
        };

        // Áp dụng style của flex cho table nếu có
        const applyFlexStyle = (style) => {
            return hasFlexData(flex) ? { ...style, ...flex.props.style } : style;
        };

        function findChildById(children, id) {
            return children?.find(child => child.id === id);
        }
        const foundChild = hasFlexData(flex) && findChildById(flex.children, id);
        const renderExtraButtons = (buttons, props, lang) => {
            console.log(157, props)
            return Object.entries(buttons).map(([key, value]) => {

                if (!value.state) {
                    return null;
                }

                switch (key) {
                    case 'add':
                        return (
                            <FontAwesomeIcon icon={faSquarePlus} key={key} onClick={() => redirectToInput(buttons.add.api.url)} className="icon-add mr-2 pointer" />
                        );

                    case 'import':
                        return (
                            // <FontAwesomeIcon icon={faFileImport} key={key} className="icon-import mr-2 pointer" />
                            <>
                                <FontAwesomeIcon icon={faFileImport} className={`size-24 mr-2 icon-add pointer `} id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" />
                                <input type="file" style={{ display: 'none' }} />
                                <ul class="dropdown-menu " aria-labelledby="navbarDropdownMenuLink">
                                    <li ><span class="dropdown-item" onClick={() => redirectToImportData(props.buttons.import.api.url.split('/')[2], props.source.get.url, props.buttons.add.api)} >Import File</span></li>
                                    <li class="dropdown-submenu dropdown-submenu-left">
                                        <a class="dropdown-item dropdown-toggle" href="#">File mẫu</a>
                                        <ul class="dropdown-menu first-sub-menu">
                                            <li onClick={() => exportToCSV("xlsx", props?.source?.tables?.[0]?.fields)}><span class="dropdown-item" > Excel</span></li>
                                            <li onClick={() => exportToCSV("csv", props?.source?.tables?.[0]?.fields)}><span class="dropdown-item" >CSV</span></li>
                                        </ul>
                                    </li>
                                </ul>
                            </>
                        );
                    case 'export':
                        return (
                            <FontAwesomeIcon icon={faDownload} className="icon-export" onClick={() => exportFile(props.source.fields, props.source.get.url, buttons.export.api.url)} data-toggle="modal" data-target="#exportExcel" />
                        );
                        break;
                    // Thêm các trường hợp khác nếu cần
                }
                return null;
            }).filter(Boolean);
        };
        switch (type) {
            case 'text':
                return <div style={props.style}>{props.content}</div>;
            case 'table':
                const extraButtons = hasFlexData(flex) ? renderExtraButtons(foundChild.props.buttons, props) : renderExtraButtons(props.buttons, props);
                const tableStyle = applyFlexStyle(props.style); // Áp dụng style ở đây
                return (
                    <div style={tableStyle}>
                        <div class="d-flex align-items-center mt-2">
                            {props.name}
                            {extraButtons.length > 0 && <div class="ml-auto mb-1">{extraButtons}</div>}
                        </div>
                        <RenderTable apiData={apiData} props={props} buttons={props.buttons} handleSearchClick={handleSearchClick} redirectToInputPUT={redirectToInputPUT} handleDelete={handleDelete} handleViewDetail={handleViewDetail} />
                    </div>
                );
            case 'flex':
                // Các logic khác cho flex
                return (
                    <>
                        <div class="d-flex align-items-center mt-2">
                            hi
                        </div>
                    </>
                );
            default:
                return <div>Unknown component type!</div>;
        }
    };
    return (
        <div class="row">
            <div class="col-md-12" >
                <div class="white_shd full">
                    <div class="full graph_head_cus d-flex">
                        {component?.map((comp) => (
                            <div key={comp.id}>
                            </div>
                        ))}
                    </div>
                    <div class="full inner_elements">
                        <div class="row" >
                            <div class="col-md-12">
                                <div class="tab_style2">
                                    <div class="tabbar padding_infor_info">
                                        <div class="tab-content" id="nav-tabContent">
                                            <div class={`tab-pane fade ${'nav-home_s2' ? 'show active' : ''}`} id="nav-home_s2" role="tabpanel" aria-labelledby="nav-home-tab">
                                                <div class="table_section">
                                                    <div class="col-md-12">
                                                        {component?.map((comp) => (
                                                            <div key={comp.id} style={{
                                                                order: comp.flex?.order,
                                                                flexGrow: comp.flex?.flexGrow
                                                            }}>
                                                                {comp.name === 'flex' ?
                                                                    <div class="">
                                                                        {comp.children?.map((compflex) => <div key={compflex.id}>{renderByType(compflex.name, compflex.props, comp, compflex.id)} </div>)}
                                                                    </div>
                                                                    :
                                                                    renderByType(comp.name, comp.props)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RenderTable = (props) => {
    //console.log(328, props)
    const tableProps = props.props
    const buttons = props.buttons
    const redirectToInputPUT = props.redirectToInputPUT
    const handleViewDetail = props.handleViewDetail
    const handleDelete = props.handleDelete
    // const handleSearchClick = props.handleSearchClick

    const data = props.apiData
    const { lang, proxy, auth, functions } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const [searchValues, setSearchValues] = useState({});
    const [apiData, setApiData] = useState([])
    // useEffect(() => {
    //     setApiData(data)
    // }, [data]);
    //console.log(342, apiData)
    const { fields, search, get } = tableProps.source;
    const { navigator } = tableProps.buttons;
    const visibility = tableProps.visibility;
    const [currentPage, setCurrentPage] = useState(1);


    // const handleSearchClick = () => {

    //     //console.log(762, data)
    //     setCurrentPage(1);
    //     if (currentPage === 1) {

    //         // callApiCount()

    //         // callApi(data);

    //         // callApiStatistic()
    //         // setSumerize(0)
    //     }
    // }

    const handleSearchClick = (data, dataurl) => {

        // setSearching(true)
        setCurrentPage(1);
        // callApiCount()
        // callApi(0);
        callApi(data, dataurl)

    }



    // Hàm để xử lý thay đổi giá trị tìm kiếm
    const handleInputChange = (fieldAlias, value) => {
        setSearchValues({ ...searchValues, [fieldAlias]: value });
    };

    // Hàm xử lý sự kiện nhấn phím, ví dụ nhấn Enter để tìm kiếm
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            // handleSearchClick(searchValues, props.source.search.url);
        }
    };


    //console.log(visibility)
    const hasInlineButtons = Object.keys(buttons).some(key =>
        buttons[key].state && !['add', 'import', 'export'].includes(key));


    const rowsPerPage = /*functions.findRowsPerPage(component)*/ 2;

    const totalPages = Math.ceil(apiData.length / rowsPerPage);

    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;

    const currentData = apiData.slice(indexOfFirst, indexOfLast);
    //console.log(396, currentData)
    const paginate = (pageNumber) => {
        if (pageNumber < 1) return;
        if (pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const renderSourceButtons = (source, lang) => {
        console.log(source)
        return Object.entries(source).map(([key, value]) => {
            if (!value.state) {
                return null;
            }
            switch (key) {
                case 'search':
                    return (
                        <FontAwesomeIcon icon={faMagnifyingGlass} key={key} onClick={() => handleSearchClick(searchValues, source.search.url)} className="icon-add mr-2 pointer" />
                    );
                    break
            }
            return null;
        }).filter(Boolean);
    };

    const callApiView = (url, startAt = 0, amount = 15) => {
        const headerApi = {
            // Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }

        //console.log(55, url)
        fetch(`${proxy()}${url}`, {
            headers: headerApi
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, limit, statistic } = res;
                console.log(123456, res)
                setApiData([])
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));

                    // setLimit(limit)
                    // setApiViewData(data)
                    // setApiViewFields(fields)
                }
            });

    }

    useEffect(() => {
        callApiView(get.url)
    }, []);

    
    const callApi = (data, dataUrl, startIndex = currentPage - 1,) => {
        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;

        const searchBody = {
            start_index: startIndex,
            criteria: data,
            require_count: false,
            require_statistic: false,
        }
        console.log("ĐÂY LÀ BODY:", searchBody)
        if (dataUrl) {

            fetch(`${proxy()}${dataUrl}`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    Authorization: _token,
                    fromIndex: currentPage - 1
                },
                body: JSON.stringify(searchBody)
            })
                .then(res => res.json())
                .then(res => {
                    const { success, content, data, result, total, fields, count, sumerize } = res;
                    const statisticValues = res.statistic;
                    console.log(74, res)
                    if (success) {
                        setApiData(data.filter(record => record != undefined));

                        // setDataStatis(statisticValues);
                        // setLoaded(true);
                        // if (data.length < 15) {
                        //     setTotalPages(currentPage);
                        // } else if (currentPage === totalPages) {
                        //     setTotalPages(prevTotalPages => prevTotalPages + 1);
                        // }

                    } else {
                        // setApiData([]);
                        // setApiDataName([])
                    }

                    const endTime = new Date().getTime();
                    const elapsedTime = endTime - startTime;
                    clearTimeout(loadingTimeout);
                    clearTimeout(loadingTimeoutSearch);// Clear the timeout
                    // setLoadingSearch(false);
                    // setLoading(false)
                    // //console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
                });
        }

    };
    return (

        <div>
            <div class="table-responsive mb-2">
                <table class="table " style={tableProps.style}>
                    <thead>
                        <tr>
                            {visibility.indexing && <th>#</th>}
                            {fields.map(field => (
                                <th key={field.id}>{field.field_name}</th>
                            ))}
                            {hasInlineButtons && <th class="align-center" style={{ minWidth: "200px", maxWidth: "200px" }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {visibility.indexing && <th></th>}
                            {fields.map((field, index) => (
                                <th key={index} className="header-cell" style={{ minWidth: "200px" }}>
                                    <input
                                        type="search"
                                        className="form-control"
                                        value={searchValues[field.fomular_alias] || ''}
                                        onChange={(e) => handleInputChange(field.fomular_alias, e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </th>
                            ))}
                            <th class="align-center"> {renderSourceButtons(tableProps.source)}</th>
                        </tr>

                        {currentData.map((row, index) => {
                            if (row) {
                                return (
                                    <tr key={index}>
                                        <td scope="row" style={{ minWidth: "50px" }} className="cell">{indexOfFirst + index + 1}</td>

                                        {fields?.map((header) => (
                                            <td key={header.fomular_alias} className="cell">{functions.renderData(header, row)}</td>
                                        ))}
                                        {hasInlineButtons && (
                                            <td class="align-center" style={{ minWidth: "200px", maxWidth: "200px" }}>
                                                {/* {renderInlineButtonsForRow(buttons, row)} */}
                                                < RenderInlineButtonsForRow {...props} row={row} redirectToInputPUT={redirectToInputPUT} handleViewDetail={handleViewDetail} handleDelete={handleDelete} />
                                            </td>
                                        )}
                                    </tr>)
                            } else {
                                return null
                            }
                        })}

                    </tbody>
                </table>
            </div>
            {
                currentData && currentData.length > 0 &&
                // renderPagination(navigator, visibility)
                <div className="d-flex justify-content-between align-items-center mt-1">
                    <p>
                        {lang["show"]} {apiData.length > 0 ? indexOfFirst + 1 : 0}-{Math.min(indexOfLast, apiData.length)} {lang["of"]} {apiData.length} {lang["results"]}
                    </p>
                    <nav aria-label="Page navigation example">
                        <ul className="pagination mb-0">
                            {/* Nút đến trang đầu */}
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(1)}>
                                    &#8810;
                                </button>
                            </li>
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(Math.max(1, currentPage - 1))}>
                                    &laquo;
                                </button>
                            </li>
                            {currentPage > 2 && <li className="page-item"><span className="page-link">...</span></li>}
                            {Array(totalPages).fill().map((_, index) => {
                                if (
                                    index + 1 === currentPage ||
                                    (index + 1 >= currentPage - 1 && index + 1 <= currentPage + 1)
                                ) {
                                    return (
                                        <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                            <button className="page-link" onClick={() => paginate(index + 1)}>
                                                {index + 1}
                                            </button>
                                        </li>
                                    );
                                }
                                return null;  // Đảm bảo trả về null nếu không có gì được hiển thị
                            })}
                            {currentPage < totalPages - 1 && <li className="page-item"><span className="page-link">...</span></li>}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(Math.min(totalPages, currentPage + 1))}>
                                    &raquo;
                                </button>
                            </li>
                            {/* Nút đến trang cuối */}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => paginate(totalPages)}>
                                    &#8811;
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            }
        </div>
    );
};



const RenderInlineButtonsForRow = (props) => {
    //console.log(420, props)
    const { buttons, row, handleViewDetail, redirectToInputPUT, handleDelete } = props
    const orderedKeys = ['approve', 'unapprove', 'detail', 'update', 'delete']; // Thứ tự mong muốn

    return orderedKeys.filter(key => buttons[key] && buttons[key].state).map(key => {
        switch (key) {
            case 'approve':
                return <i className="fa fa-check-circle-o size-24 pointer icon-margin icon-check" key={key}></i>;
            case 'unapprove':
                return <i className="fa fa-times-circle-o size-24 pointer icon-margin icon-close" key={key}></i>;
            case 'detail':
                return <i className="fa fa-eye size-24 mr-2 pointer icon-view" key={key} onClick={() => handleViewDetail(row, props.buttons.detail.api.url)} ></i>;
            case 'update':
                return <i className="fa fa-edit size-24 pointer mr-2 icon-margin icon-edit" key={key} onClick={() => redirectToInputPUT(row, props.buttons.update.api.url)}></i>;
            case 'delete':
                return <i className="fa fa-trash-o size-24 pointer icon-delete" key={key} onClick={() => handleDelete(row, props.buttons.delete.api.url)}></i>;
            default:
                return <button key={key}>{key}</button>;
        }
    });
};
export default RenderComponent;
