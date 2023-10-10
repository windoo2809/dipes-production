import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport, faDownload, faSquarePlus, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import StatisTable from '../statistic/table'
import Swal from 'sweetalert2';
import ReactECharts from 'echarts-for-react';
import $ from 'jquery'
import XLSX from 'xlsx-js-style';
import { PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, AreaChart, Area, ComposedChart, ScatterChart, Scatter } from 'recharts';
import Layout_Active from "../step/active"


const RECORD_PER_PAGE = 10



export default (props) => {
    const { lang, proxy, auth, pages, functions, socket } = useSelector(state => state);
    const { openTab, renderDateTimeByFormat } = functions
    const { project_id, version_id, url } = useParams();
    const _token = localStorage.getItem("_token");
    const { formatNumber } = functions
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser) || {}
    const [selectedFileType, setSelectedFileType] = useState('xlsx');
    const [searchValues, setSearchValues] = useState({});
    const rowsPerPage = 15;
    const [currentPage, setCurrentPage] = useState(0);
    const [searching, setSearching] = useState(false);
    const [totalPages, setTotalPages] = useState(0);

    // console.log(props)
    const [loaded, setLoaded] = useState(false);
    const [previousSearchValues, setPreviousSearchValues] = useState({});
    const [currentCount, setCurrentCount] = useState(null);



    // const [currentPage, setCurrentPage] = useState(0)
    const [apiData, setApiData] = useState([])
    const [apiDataName, setApiDataName] = useState([])
    const [sumerize, setSumerize] = useState(0)
    const [dataStatis, setDataStatis] = useState([])
   
    const [dataTable_id, setDataTableID] = useState(null);
    const [dataTables, setDataTables] = useState([]);
    const [dataFields, setDataFields] = useState([]);

    const [loadingExportFile, setLoadingExportFile] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingResult, setLoadingResult] = useState(false);

    // const activeTab = props.activeTab
    const page = props.page
    const statusActive = props.statusActive
    const dataCheck = props.dataCheck
    const [activeTab, setActiveTab] = useState('nav-home_s2');
    // Check trang chi tiết
    const checkDetail = page.components?.[0]?.api_detail

    useEffect(() => {
        if (!dataStatis || dataStatis.length === 0 && activeTab === 'nav-profile_s2') {
            setActiveTab('nav-home_s2');
        }
    }, [dataStatis]);

    // console.log(apiData)


    // Client side
    //Thêm 
    useEffect(() => {

        socket.on("/dipe-production-new-data-added", newData => {

            if (Object.keys(newData).length !== 0 && Object.keys(searchValues).length === 0) {
                setSumerize(prevSumerize => prevSumerize + 1);
                if (currentPage === totalPages && apiData.length > 15) {
                    setApiData(prevData => [...prevData, newData.data]);
                }
            }

        });

        return () => {
            socket.off("/dipe-production-new-data-added");
        }
    }, [searchValues, totalPages, currentPage, apiData]);



    //Sửa
    useEffect(() => {
        socket.on("/dipe-production-update-data", (newData) => {
            const matchesAllKeys = (item, obj) => {
                return Object.entries(obj).every(([key, value]) => item[key] === value);
            };

            // Tìm index của phần tử cần cập nhật
            const indexToUpdate = apiData.findIndex(item => matchesAllKeys(item, newData.key));

            // Nếu tìm thấy phần tử cần cập nhật
            if (indexToUpdate !== -1) {
                const updatedData = [...apiData];
                updatedData[indexToUpdate] = {
                    ...updatedData[indexToUpdate],
                    ...newData.data
                };

                setApiData(updatedData);
            }
        });


        return () => {
            socket.off("/dipe-production-update-data");
        }
    }, [apiData]);

    // Xóa  
    useEffect(() => {
        socket.on("/dipe-production-delete-data", (newData) => {
            const matchesAllKeys = (item, obj) => {
                return Object.entries(obj).every(([key, value]) => item[key] === value);
            };

            // Tìm index của phần tử cần xóa
            const indexToDelete = apiData.findIndex(item => matchesAllKeys(item, newData.key));

            // Nếu tìm thấy phần tử cần xóa
            if (indexToDelete !== -1) {
                const updatedData = [...apiData];
                updatedData.splice(indexToDelete, 1); // Xóa phần tử tại vị trí tìm thấy
                setApiData(updatedData);
                setSumerize(prevSumerize => prevSumerize - 1);
            }
        });

        return () => {
            socket.off("/dipe-production-delete-data");
        }
    }, [apiData]);




    const callApi = (startIndex = currentPage - 1,) => {
        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        if (Object.keys(searchValues).length !== 0) {
            loadingTimeoutSearch = setTimeout(() => {
                setLoadingSearch(true);
            }, 310);
        }

        loadingTimeout = setTimeout(() => {
            setLoading(true)
        }, 300);

        const searchBody = {
            table_id: dataTable_id,
            start_index: startIndex,
            criteria: searchValues,
            require_count: false,
            require_statistic: false,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        // console.log("ĐÂY LÀ BODY:", searchBody)

        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
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
                // console.log(74, res)
                if (success) {
                    setApiData(data.filter(record => record != undefined));

                    setDataStatis(statisticValues);
                    setLoaded(true);



                } else {
                    setApiData([]);
                    setApiDataName([])
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout);
                clearTimeout(loadingTimeoutSearch);// Clear the timeout
                setLoadingSearch(false);
                setLoading(false)
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    const callApiView = (startAt = 0, amount = 15) => {

        let loadingTimeout;
        loadingTimeout = setTimeout(() => {
            setLoading(true)
        }, 350);
        const headerApi = {
            Authorization: _token,
            'start-at': startAt,
            'data-amount': amount
        }

        const apiGet = page.components?.[0]?.api_get;
        fetch(`${proxy()}${apiGet}`, {
            headers: headerApi
        })

            .then(res => res.json())
            .then(res => {
                const { success, content, data, count, fields, limit, statistic } = res;
                // console.log(res)
                setApiDataName(fields);
                if (data && data.length > 0) {
                    setApiData(data.filter(record => record != undefined));
                    // setApiDataName(fields);
                    setDataStatis(statistic);

                    setSumerize(count)
                    // setLimit(limit)
                    // setApiViewData(data)
                    // setApiViewFields(fields)
                }
                clearTimeout(loadingTimeout);
                setLoading(false)
            });

    }
    const callApiCount = (requireCount = false) => {

        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        // if (Object.keys(searchValues).length !== 0) {
        //     loadingTimeoutSearch = setTimeout(() => {
        //         setLoadingSearch(true);
        //     }, 310);
        // }
        loadingTimeout = setTimeout(() => {

            // setLoading(true)
            setLoadingResult(true)
        }, 300);

        if (JSON.stringify(searchValues) !== JSON.stringify(previousSearchValues)) {
            setPreviousSearchValues(searchValues);
            requireCount = true;
        }

        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: true,
            require_statistic: false,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        // console.log(searchBody)
        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
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
                // console.log(74, res)
                if (success) {
                    // setApiData(data.filter(record => record != undefined));
                    // setApiDataName(fields);
                    // setDataStatis(statisticValues);
                    // setLoaded(true);

                    if (count !== undefined && requireCount) {
                        setCurrentCount(count);
                        setSumerize(count);
                    } else if (sumerize !== undefined) {
                        setSumerize(sumerize);
                    } else if (!requireCount && currentCount != null) {
                        setSumerize(currentCount);
                    }
                } else {
                    setApiData([]);
                    setApiDataName([])
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout);
                clearTimeout(loadingTimeoutSearch);// Clear the timeout
                setLoadingResult(false)
                // setLoadingSearch(false);
                // setLoading(false)
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    const callApiStatistic = (requireCount = false) => {

        const startTime = new Date().getTime();
        let loadingTimeout;
        let loadingTimeoutSearch;
        // if (Object.keys(searchValues).length !== 0) {
        //     loadingTimeoutSearch = setTimeout(() => {
        //         setLoadingSearch(true);
        //     }, 310);
        // }

        loadingTimeout = setTimeout(() => {

            // setLoading(true)
            setLoadingResult(true)
        }, 300);


        if (JSON.stringify(searchValues) !== JSON.stringify(previousSearchValues)) {
            setPreviousSearchValues(searchValues);
            requireCount = true;
        }

        const searchBody = {
            table_id: dataTable_id,
            start_index: currentPage - 1,
            criteria: searchValues,
            require_count: false,
            require_statistic: true,
            api_id: page.components?.[0]?.api_get.split('/')[2]
            // exact: true
        }

        // console.log(searchBody)

        fetch(`${proxy()}${page.components?.[0]?.api_search}`, {
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
                // console.log(74, res)
                if (success) {
                    // setApiData(data.filter(record => record != undefined));
                    // setApiDataName(fields);
                    setDataStatis(statisticValues);
                    // setLoaded(true);


                } else {
                    setApiData([]);
                    setApiDataName([])
                }

                const endTime = new Date().getTime();
                const elapsedTime = endTime - startTime;

                clearTimeout(loadingTimeout);
                clearTimeout(loadingTimeoutSearch);// Clear the timeout
                setLoadingResult(false)
                // setLoadingSearch(false);
                // setLoading(false)
                // console.log(`---------------------------------TimeResponse: ${elapsedTime} ms`);
            });
    };
    useEffect(() => {
        setCurrentPage(1)
    }, [page, url])



    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const current = apiData

    const paginate = (pageNumber) => {
        const startAt = (pageNumber - 1) * rowsPerPage;
        if (Object.keys(searchValues).length === 0 || !searching) {
            callApiView(startAt, rowsPerPage);
        }
        else {
            callApi(pageNumber - 1);
        }
        setCurrentPage(pageNumber);
    };

    const accurateTotalPages = Math.ceil(sumerize / rowsPerPage);
    if (totalPages !== accurateTotalPages) {
        setTotalPages(accurateTotalPages);
    }
    useEffect(() => {
        if (page && page.components) {
            // const id_str = page.components?.[0]?.api_post.split('/')[2];
            const id_str = page.components?.[0]?.api_post.split('/')[2];
            // console.log(id_str)
            fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                headers: {
                    Authorization: _token
                }
            })
                .then(res => res.json())
                .then(res => {
                    const { data, success, content } = res;
                    // console.log(res)
                    if (success) {
                        setDataTables(data.tables)
                        setDataTableID(data.tables[0].id)
                        setDataFields(data.body)
                        setLoaded(true)
                    }
                })
        }
    }, [page, dataTable_id])

    useEffect(() => {
        if (page && page.components) {
            setApiData([])
            callApiView()
        }
    }, [page, dataTable_id])
    //searching
    // console.log(loadingSearch)
    useEffect(() => {
        let timeout;
        if (loadingSearch) {
            Swal.fire({
                title: lang["searching"],
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 10);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [loadingSearch]);
    ///Loading
    useEffect(() => {
        let timeout;
        if (!loadingSearch && loading) {
            Swal.fire({
                title: lang["loading"],
                allowEscapeKey: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 500);
        }
        return () => {
            clearTimeout(timeout);
        };
    }, [loading]);

    const renderBoolData = (data, field) => {
        const IF_TRUE = field.DEFAULT_TRUE;
        const IF_FALSE = field.DEFAULT_FALSE
        if (data != undefined) {
            if (data) {
                return IF_TRUE ? IF_TRUE : "true"
            }
            return IF_FALSE ? IF_FALSE : "false"
        } else {
            return IF_FALSE ? IF_FALSE : "false"
        }
    }

    const [isInitialRender, setIsInitialRender] = useState(true);

    useEffect(() => {
        let timeout;
        if (isInitialRender) {
            setIsInitialRender(false);
            return;
        }


        if (loadingExportFile) {
            Swal.fire({
                title: lang["loading"],
                allowEscapeKey: false,
                allowOutsideClick: false,

                didOpen: () => {
                    Swal.showLoading();
                }
            });
        } else {
            timeout = setTimeout(() => {
                Swal.close();
            }, 1000);
        }
    }, [loadingExportFile]);

    const renderData = (field, data) => {
        if (data) {
            switch (field.DATATYPE) {
                case "DATE":
                case "DATETIME":
                    return renderDateTimeByFormat(data[field.fomular_alias], field.FORMAT);
                case "DECIMAL":
                case "DECIMAL UNSIGNED":
                    const { DECIMAL_PLACE } = field;
                    const decimalNumber = parseFloat(data[field.fomular_alias]);
                    return decimalNumber.toFixed(DECIMAL_PLACE)
                case "BOOL":
                    return renderBoolData(data[field.fomular_alias], field)
                default:
                    return data[field.fomular_alias];
            }
        } else {
            return "Invalid value"
        }
    };

    const redirectToInputPUT = async (record) => {

        const { components } = page;
        const cpn = components[0]
        const { api_put } = cpn;
        if (api_put != undefined) {
            const id_str = api_put.split('/')[2]

            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        if (success) {
                            // console.log("succcess", data)
                            setDataTables(data.tables)
                            setDataFields(data.body)
                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                openTab(`/page/${url}/put/api/${id_str}/${stringifiedParams}?myParam=${url}`)

            }
        } else {
            Swal.fire({
                title: lang["faild"],
                text: lang["not found update"],
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            })
        }
    }

    const redirectToInput = () => {
        const id_str = page.components?.[0]?.api_post.split('/')[2];
        window.location.href = `${url}/apis/api/${id_str}/input_info`;
    }

    const handleDelete = (data) => {
        // console.log(data)


        const id_str = page.components?.[0]?.api_delete.split('/')[2];
        let api_delete = page.components[0].api_delete;

        let primaryKeys = dataTables && dataTables[0] && dataTables[0].primary_key ? dataTables[0].primary_key : null;
        let newParams = api_delete;
        if (primaryKeys) {
            let foundObjects = dataFields.filter((obj) => primaryKeys.includes(obj.id));

            if (foundObjects.length > 0) {
                // Lấy ra mảng các id từ foundObjects
                let fomular_alias = foundObjects.map(obj => obj.fomular_alias);
                // console.log(fomular_alias)

                const newData = [];

                fomular_alias.map(alias => {
                    newData.push(data[alias])
                })

                // console.log(newData);
                // Tạo chuỗi newParams bằng cách nối api_delete và ids
                newParams = `${api_delete}/${newData.join("/")}`;


            } else {
                // console.log('Không tìm thấy đối tượng nào có id trong primaryKeys');
            }
        } else {
            // console.log('Không tìm thấy primaryKeys');
        }
        // console.log(newParams);

        Swal.fire({
            title: lang["confirm"],
            text: lang["confirm.content"],
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: lang["btn.delete"],
            cancelButtonText: lang["btn.cancel"],
            confirmButtonColor: 'rgb(209, 72, 81)',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${proxy()}${newParams}`, {
                    method: 'DELETE',
                    headers: {
                        "content-type": "application/json",
                        Authorization: `${_token}`,
                    },
                    body: JSON.stringify({ position: data.__position__ })
                })
                    .then(res => res.json())
                    .then((resp) => {
                        const { success, content, data, status } = resp;
                        // console.log(resp)
                        // functions.showApiResponseMessage(status)

                        if (success) {
                            Swal.fire({
                                title: lang["success"],
                                text: lang["success.delete"],
                                icon: "success",
                                showConfirmButton: false,
                                timer: 1500,
                            }).then(function () {
                                setCurrentPage(1);
                                setApiData([])
                                setSumerize(0)
                                callApiView()
                            });
                        } else {
                            Swal.fire({
                                title: lang["faild"],
                                text: lang["fail.delete"],
                                icon: "error",
                                showConfirmButton: false,
                                timer: 2000,
                            }).then(function () {
                                // Không cần reload trang
                            });
                        }
                    });
            }
            const dataSubmit = {
                api_id: id_str,
                current_page: undefined,
                data: data
            }

            socket.emit("/dipe-production-delete-data", dataSubmit);
        });
    }

    const handleViewDetail = async (record) => {

        const { components } = page;
        const cpn = components[0]
        const { api_detail } = cpn;
    
        if (api_detail != undefined) {
            const id_str = api_detail.split('/')[2]

            const response = await new Promise((resolve, reject) => {
                fetch(`${proxy()}/apis/api/${id_str}/input_info`, {
                    headers: {
                        Authorization: _token
                    }
                })
                    .then(res => res.json())
                    .then(res => {
                        const { data, success, content } = res;
                        if (success) {
                            // console.log("succcess", data)
                            setDataTables(data.tables)
                            setDataFields(data.body)
                        }
                        resolve(res)
                    })
            })
            const { success, data } = response;
            if (success) {
                const { params } = data;
                const stringifiedParams = params.map(param => {
                    const { fomular_alias } = param
                    return record[fomular_alias]
                }).join('/')
                openTab(`/page/${url}/detail/${id_str}/${stringifiedParams}?myParam=${url}`)

            }
        } else {
            Swal.fire({
                title: lang["faild"],
                text: lang["not found"],
                icon: "error",
                showConfirmButton: false,
                timer: 2000,
            })
        }
    }

    const redirectToImportData = () => {
        window.location.href = `/page/${url}/import`;
    }

    const handleKeyDown = (event) => {
        if (event.keyCode === 13) {
            handleSearchClick();
        }
    }

    const handleSearchClick = () => {
        setSearching(true)
        setCurrentPage(1);
        callApiCount()
        callApi(0);
        callApiStatistic()
        setApiData([])
        setSumerize(0)
    }

    useEffect(() => {
        if (Object.keys(searchValues).length === 0) {
            setSearching(false)
        }
        else {
        }
    }, [searching]);

    const handleInputChange = (fomular_alias, value) => {
        setSearchValues(prevValues => {
            if (value.trim() === '') {
                const { [fomular_alias]: _, ...newValues } = prevValues;
                return newValues;
            } else {
                return {
                    ...prevValues,
                    [fomular_alias]: value
                };
            }
        });
    };

    const exportToCSV = (csvData) => {
        const selectedHeaders = dataFields;
        function styleHeaders(ws) {
            const headerStyle = {
                fill: {
                    fgColor: { rgb: "008000" }
                },
                font: {
                    bold: true,
                    color: { rgb: "fffffff" }
                }
            };

            const colNum = XLSX.utils.decode_range(ws['!ref']).e.c + 1;
            for (let i = 0; i < colNum; ++i) {
                const cellRef = XLSX.utils.encode_cell({ c: i, r: 0 });
                if (ws[cellRef]) {
                    ws[cellRef].s = headerStyle;
                }
            }
        }
        const generateSampleData = (field) => {
            switch (field.DATATYPE) {
                case "INT":
                    return "0001";
                case "INT UNSIGNED":
                    return "0001";
                case "BIGINT":
                    return "0001";
                case "BIGINT UNSIGNED":
                    return "0001";
                case "TEXT":
                    return "Sample Text";
                case "BOOL":
                    return "True/False";
                case "DECIMAL":
                    return "1.00";
                case "DECIMAL":
                    return "1.0";
                case "CHAR":
                    return "a";
                case "EMAIL":
                    return "abc@gmail.com";
                case "PHONE":
                    return "0123456789";
                case "DATE":
                    return "01/11/2022";
                case "DATETIME":
                    return "01/11/2022 10:10:26";
                default:
                    return "Sample Text";
            }
        }
        // const headerRow = selectedHeaders.reduce((obj, header) => ({ ...obj, [header.fomular_alias]: header.display_name }), {});
        const segments = page.url.split('/');
        const lastSegment = segments[segments.length - 1];//tên
        const result = lastSegment.replace(/-/g, '');

        const headerRow = selectedHeaders.map(header => `${header.field_name}(${header.fomular_alias})`);
        const sampleRow = selectedHeaders.map(header => generateSampleData(header));

        if (selectedFileType === 'xlsx') {
            const ws = XLSX.utils.json_to_sheet([headerRow, sampleRow], { skipHeader: true });
            styleHeaders(ws);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Template");


            XLSX.writeFile(wb, `TEMPLATE_${result.toUpperCase()}_${(new Date()).getTime()}.xlsx`);

        } else if (selectedFileType === 'csv') {
            const utf8BOM = "\uFEFF";
            const csv = utf8BOM + headerRow.join(",") + "\n" + sampleRow.join(",") + "\n";

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `TEMPLATE_${result.toUpperCase()}_${(new Date()).getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        $('#closeModalExportFileSample').click();
    }


    return (
        <>
            {/* modal export excel/csv example */}
            <div class={`modal `} id="exportExcelEx">
                <div class="modal-dialog modal-dialog-center">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h4 class="modal-title">{lang["export sample data"]}</h4>
                            <button type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <form>
                                <h5 class="mt-4 mb-2">{lang["select export type"]}:</h5>
                                <div>
                                    <label>
                                        <input
                                            type="radio"
                                            name="fileType"
                                            value="xlsx"
                                            checked={selectedFileType === 'xlsx'}
                                            onChange={e => setSelectedFileType(e.target.value)}
                                        />
                                        <span className="ml-2">Excel</span>
                                    </label>
                                    <label className="ml-4">
                                        <input
                                            type="radio"
                                            name="fileType"
                                            value="csv"
                                            checked={selectedFileType === 'csv'}
                                            onChange={e => setSelectedFileType(e.target.value)}
                                        />
                                        <span className="ml-2">CSV</span>
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" onClick={exportToCSV} class="btn btn-success">{lang["export"]}</button>
                            <button type="button" id="closeModalExportFileSample" class="btn btn-danger" data-dismiss="modal">{lang["btn.close"]}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-12">
                <div class="white_shd full">
                    <div class="full graph_head_cus d-flex">
                      <Layout_Active />
                    </div>
                </div>
            </div>
        </>

    )
}