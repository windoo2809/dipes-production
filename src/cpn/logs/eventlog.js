
import { useParams } from "react-router-dom";
import Header from "../common/header"
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Swal from 'sweetalert2';
export default () => {
    const { lang, proxy, auth } = useSelector(state => state);
    const _token = localStorage.getItem("_token");
    const stringifiedUser = localStorage.getItem("user");
    const _user = JSON.parse(stringifiedUser)
    const [logs, setLogs] = useState([]);

    const [view, setView] = useState([])
    const [filter, setFilter] = useState({ type: 'info' });
    const [showModal, setShowModal] = useState(false);
    
    let langItem = localStorage.getItem("lang") ? localStorage.getItem("lang") : "Vi";
    const languages = langItem.toLowerCase();
    // //console.log(_token)
    const handleCloseModal = () => {
        setShowModal(false);
    };
    const eventType = [
        { id: 0, label: lang["log.information"], value: 1, color: "#3029F7", icon: "fa fa-info-circle size-log " },
        { id: 1, label: lang["log.warning"], value: 2, color: "#f3632e", icon: "fa fa-warning size" },
        { id: 2, label: lang["log.error"], value: 3, color: "#FF0000", icon: "fa fa-times-circle fa-2x" },

    ]
    useEffect(() => {
        const stringifiedUser = localStorage.getItem("user");
        const user = JSON.parse(stringifiedUser)
        const { role } = user;
        const validPrivileges = ["uad"]

        if (validPrivileges.indexOf(role) == -1) {
            // window.location = "/404-notfound"
        }
    }, [])

    useEffect(() => {
        fetch(`${proxy()}/logs/${languages}`, {
            headers: {
                Authorization: _token
            }
        })
            .then(res => res.json())
            .then(resp => {
                const { success, data, status, content } = resp;
                if (success) {
                    if (data != undefined && data.length > 0) {
                        const dataFilter = _user.username !== "administrator" ? data.filter(item => item.create_user === _user.username) : data;
                        setLogs(dataFilter)
                        setView(dataFilter);
                    }
                } else {
                    window.location = "/login"
                }
            })
    }, [])

    const [logDetail, setLogDetail] = useState([]);

    const detailLogs = async (logid) => {
        // //console.log(logid)
        setLogDetail(logid)
    };

    const submitFilter = (e) => {
        e.preventDefault();
        filter["lang"] = languages
        fetch(`${proxy}/logs/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `${_token}`,
            },
            body: JSON.stringify(filter),
        })
            .then(res => res && res.json())
            .then((resp) => {
                if (resp) {
                    const { success, content, data, status } = resp;
                    // //console.log(resp)
                    if (success) {

                        setView(data)
                        // window.location.reload();
                        setShowModal(false);

                    } else {
                        Swal.fire({
                            title: "Thất bại!",
                            text: content,
                            icon: "error",
                            showConfirmButton: false,
                            timer: 2000,
                        });
                    }
                }
            })
    };

    const [currentPageLogs, setCurrentPageLogs] = useState(1);
    const rowsPerPageLogs = 17;
    const indexOfLastMemberLogs = currentPageLogs * rowsPerPageLogs;
    const indexOfFirstMemberLogs = indexOfLastMemberLogs - rowsPerPageLogs;
    const currentMembersLogs = view.slice(indexOfFirstMemberLogs, indexOfLastMemberLogs);
    const paginateLogs = (pageNumber) => setCurrentPageLogs(pageNumber);
    const totalPagesLogs = Math.ceil(view.length / rowsPerPageLogs);

    function openModalWithContent(jsonContent) {
        // Định dạng JSON để hiển thị đẹp hơn
        const formattedJson = JSON.stringify(jsonContent, null, 4);
    }

    return (
        <div class="midde_cont">
            <div class="container-fluid">
                <div class="row column_title">
                    <div class="col-md-12">
                        <div class="page_title">
                            <h4>{lang["log.title"]}</h4>
                        </div>
                    </div>
                </div>
                {/* <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5>{lang["log.statis"]}</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info-logs">
                                <div class="member-cus">
                                    <div class="msg_list_main">
                                        <div className="row column1 mb-3 mt-3">
                                            <div className="col-lg-3">
                                                <label>{lang["log.type"]}:</label>
                                                <select className="form-control" value={filter.type} onChange={(e) => { setFilter({ ...filter, type: e.target.value }) }}>
                                                    <option value="info">{lang["log.information"]}</option>
                                                    <option value="warn">{lang["log.warning"]}</option>
                                                    <option value="error">{lang["log.error"]}</option>

                                                </select>
                                            </div>
                                            <div className="col-lg-3">
                                                <label>{lang["log.daystart"]}:</label>
                                                <input type="datetime-local" className="form-control" value={filter.start} onChange={
                                                    (e) => { setFilter({ ...filter, start: e.target.value }) }
                                                } />
                                            </div>
                                            <div className="col-lg-3">
                                                <label>{lang["log.dayend"]}:</label>
                                                <input type="datetime-local" className="form-control" value={filter.end} onChange={
                                                    (e) => { setFilter({ ...filter, end: e.target.value }) }
                                                } />
                                            </div>
                                            <div className="col-lg-3 d-flex align-items-end justify-content-end">
                                                <button className="btn btn-primary mr-2 mt-2 btn-log" onClick={submitFilter}>{lang["btn.ok"]}</button>
                                                <button className="btn btn-secondary btn-log" onClick={() => {
                                                    setView(logs)
                                                }}>{lang["btn.clear"]}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div class="row">
                    <div class="col-md-12">
                        <div class="white_shd full margin_bottom_30">
                            <div class="full graph_head">
                                <div class="heading1 margin_0">
                                    <h5>{lang["log.listlog"]}</h5>
                                </div>
                            </div>
                            <div class="table_section padding_infor_info">
                                <div class="table-responsive table-custom">
                                    {
                                        view && view.length > 0 ? (
                                            <>
                                                <table class="table bordered">
                                                    <thead>
                                                        <tr>
                                                            <td >{lang["log.no"]}</td>

                                                            <td  class="align-center">{lang["log.type"]}</td>
                                                            <td >{lang["log.listtitle"]}</td>
                                                            <td >{lang["description"]}</td>
                                                            <td >{lang["time"]}</td>
                                                            <td  class="align-center">{lang["log.action"]}</td>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentMembersLogs.map((log, index) => {
                                                            // Tìm kiểu sự kiện tương ứng trong mảng eventType
                                                            const event = eventType.find(item => item.label === log.event_type);

                                                            return (
                                                                <tr key={'id' + indexOfFirstMemberLogs + index + 1}>
                                                                    <td style={{ width: "50px" }}>{indexOfFirstMemberLogs + index + 1}</td>

                                                                    <td class="align-center" style={{ width: "50px" }}>
                                                                        {event && <>
                                                                            <i class={`${event.icon}`} style={{ color: event.color }} title={event.label}></i>
                                                                        </>}
                                                                    </td>
                                                                    <td style={{ width: "160px" }}>{log.event_title}</td>
                                                                    <td class="cell-log">
                                                                        {log.event_description}
                                                                    </td>
                                                                    <td class="align-center" style={{ width: "180px" }}>{log.create_at}</td>
                                                                    <td class="align-center" style={{ width: "80px" }}>
                                                                        <i class="fa fa-eye size pointer icon-margin size-24 icon-view" onClick={() => detailLogs(log)} data-toggle="modal" data-target="#viewLog" style={{ color: "green" }} title={lang["btn.viewdetail"]}></i>

                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <p>{lang["show"]} {indexOfFirstMemberLogs + 1}-{Math.min(indexOfLastMemberLogs, logs.length)} {lang["of"]} {view.length} {lang["results"]}</p>
                                                    <nav aria-label="Page navigation example">
                                                        <ul className="pagination mb-0">
                                                            <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateLogs(1)}>
                                                                    &#8810;
                                                                </button>
                                                            </li>
                                                            <li className={`page-item ${currentPageLogs === 1 ? 'disabled' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateLogs(currentPageLogs - 1)}>
                                                                    &laquo;
                                                                </button>
                                                            </li>
                                                            {currentPageLogs > 3 && <li className="page-item"><span className="page-link">...</span></li>}
                                                            {Array(totalPagesLogs).fill().map((_, index) => {
                                                                if (
                                                                    index + 1 === currentPageLogs ||
                                                                    (index + 1 >= currentPageLogs - 5 && index + 1 <= currentPageLogs + 5)
                                                                ) {
                                                                    return (
                                                                        <li key={index} className={`page-item ${currentPageLogs === index + 1 ? 'active' : ''}`}>
                                                                            <button className="page-link" onClick={() => paginateLogs(index + 1)}>
                                                                                {index + 1}
                                                                            </button>
                                                                        </li>
                                                                    )
                                                                }
                                                            })}
                                                            {currentPageLogs < totalPagesLogs - 2 && <li className="page-item"><span className="page-link">...</span></li>}
                                                            <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateLogs(currentPageLogs + 1)}>
                                                                    &raquo;
                                                                </button>
                                                            </li>
                                                            <li className={`page-item ${currentPageLogs === totalPagesLogs ? 'disabled' : ''}`}>
                                                                <button className="page-link" onClick={() => paginateLogs(totalPagesLogs)}>
                                                                    &#8811;
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </nav>
                                                </div>
                                            </>
                                        ) : (
                                            <div class="list_cont ">
                                                <p>Chưa có logs</p>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* View log */}
                <div class={`modal no-select-modal ${showModal ? 'show' : ''}`} id="viewLog">
                    <div class="modal-dialog modal-dialog-center">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h4 class="modal-title">{lang["detaillog"]}</h4>
                                <button type="button" class="close" onClick={handleCloseModal} data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <form>
                                    <div class="row">

                                        <div class="form-group col-lg-6">
                                            <label><b>{lang["log.id"]}</b></label>
                                            <span className="d-block">{logDetail.event_id} </span>
                                        </div>
                                        <div class="form-group col-lg-6">
                                            <label><b>{lang["log.type"]}</b> </label>
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                {
                                                    (() => {
                                                        const event = eventType.find(item => item.label === logDetail.event_type);
                                                        return event && <i className={` ${event.icon}`} style={{ color: event.color }} title={event.label}></i>
                                                    })()
                                                }
                                                <span className="ml-1"> {logDetail.event_type}</span>
                                            </div>

                                        </div>
                                        <div class="form-group col-lg-12">

                                            <label><b>{lang["log.listtitle"]}</b></label>
                                            <span className="d-block">
                                                {logDetail.event_title} </span>
                                        </div>
                                        <div class="form-group col-lg-12">
                                            <label><b>{lang["description"]}</b></label>
                                            <span className="d-block">
                                                {
                                                    logDetail.event_title === "Import devices' json" ?
                                                        <pre>{JSON.stringify(JSON.parse(logDetail.event_description), null, 4)}</pre> :
                                                        logDetail.event_description
                                                }
                                            </span>
                                        </div>

                                        <div class="form-group col-lg-4 col-sm-12">
                                            <label><b>{lang["log.create_user"]} </b></label>
                                            <span className="d-block">{logDetail.create_user} </span>
                                        </div>
                                        <div class="form-group col-lg-4 col-sm-12">
                                            <label><b>{lang["log.create_at"]}</b> </label>
                                            <span className="d-block">{logDetail.create_at} </span>
                                        </div>
                                        <div class="form-group col-lg-4 col-sm-12">
                                            <label><b>IP:</b></label>

                                            {
                                                (() => {
                                                    if (logDetail.ip) {
                                                        let ipString = logDetail.ip;
                                                        let ipParts = ipString.split("::ffff:");
                                                        let ipAddress = ipParts.length > 1 ? ipParts[1] : ipParts[0];

                                                        return (

                                                            <span className="d-block">{ipAddress}</span>

                                                        );
                                                    }
                                                    return null; // Hoặc bạn có thể trả về một giá trị mặc định hoặc một thành phần khác tại đây
                                                })()
                                            }
                                        </div>
                                    </div>

                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" onClick={handleCloseModal} data-dismiss="modal" class="btn btn-danger">{lang["btn.close"]}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    )
}

