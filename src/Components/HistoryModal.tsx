import { useEffect, useRef, useState } from "react";
import { useClickOutside } from "react-haiku";
import InlineMessageBox from "./InlineMessageBox";
import { useTranslation } from "react-i18next";
import { useToast } from "@/Context/ToastContext";

interface HistoryModalProps {
    operation: string;
    isShown: boolean;
    onClose: (show: boolean) => void;
}

interface LogEntry {
    id: string;
    timestamp: number;
    input_path: string;
    output_path: string;
    input_size?: number;
    output_size?: number;
    algorithm?: string;
    status?: string;
    duration?: number;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ operation, isShown, onClose }) => {
    const toast = useToast();
    const { t } = useTranslation();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [table, setTable] = useState('');
    const [historyState, setHistoryState] = useState(false);

    useEffect(() => {
        if (operation === "etext") {
            setTable('etext_logs');
            setHistoryState(localStorage.getItem('logs.etext') === "true");
        } else if (operation === "efile") {
            setTable('efile_logs');
            setHistoryState(localStorage.getItem('logs.efile') === "true");
        } else if (operation === "dtext") {
            setTable('dtext_logs');
            setHistoryState(localStorage.getItem('logs.dtext') === "true");
        } else if (operation === "dfile") {
            setTable('dfile_logs');
            setHistoryState(localStorage.getItem('logs.dfile') === "true");
        } else if (operation === "steg_in") {
            setTable('steg_in_logs');
            setHistoryState(localStorage.getItem('logs.hider') === "true");
        } else if (operation === "steg_out") {
            setTable('steg_out_logs');
            setHistoryState(localStorage.getItem('logs.extracter') === "true");
        }
    }, [operation, isShown]);

    const getLogs = async () => {
        try {
            let result: LogEntry[] = [];
            result = await window.electronAPI.getLogs(table);
            setLogs(result);

            console.log(result);
        } catch (err) {
            console.error("Failed to load logs:", err);
        }
    };

    const handleDeleteLogs = async (id: string) => {
        try {
            await window.electronAPI.deleteLog({ table: table, id: id });
            getLogs();
        } catch (error) {
            console.log("Error: ", error);
        }
    }

    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 20;

    const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [logs.length, totalPages, currentPage]);

    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = logs?.length ? logs.slice(indexOfFirstLog, indexOfLastLog) : [];

    useEffect(() => {
        if (isShown) getLogs();
    }, [operation, isShown]);

    const ModalRef = useRef(null);
    useClickOutside(ModalRef, () => onClose(false));

    const RenderModalHeader = (() => {
        switch (operation) {
            case "etext":
                return t("logs.etext");
            case "efile":
                return t("logs.efile");
            case "dtext":
                return t("logs.dtext");
            case "dfile":
                return t("logs.dfile");
            case "steg_in":
                return t("logs.steg_in");
            case "steg_out":
                return t("logs.steg_out");
            default:
                return "Unknown Logs";
        }
    })();

    return (
        <div className={`modal_box ${isShown ? "Show" : ""}`}>
            <div className="modal_content extra-large" ref={ModalRef}>
                <div className="modal_top_content_box">
                    <p className="logs_count_box"><span className="logs_count">[{logs.length}] {t("logs.logs")}</span></p>
                    <p className="modal_header">{RenderModalHeader}</p>
                    <div className="modal_top_btns">
                        <button
                            className="clear_logs_btn re"
                            disabled={logs.length === 0}
                            onClick={() => {
                                handleDeleteLogs('all');
                                onClose(false);
                                toast(1, t('toast.logs_deleted'), t('toast.logs_deleted_title'));
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"><path d="M192.8,165.12,43.93,105.57A110.88,110.88,0,0,1,61.47,82.38a8,8,0,0,1,8.67-1.81L95.52,90.85a16,16,0,0,0,20.82-9l21-53.1c4.15-10,15.47-15.33,25.63-11.53a20,20,0,0,1,11.51,26.39L153.13,96.71a16,16,0,0,0,8.93,20.75L187,127.3a8,8,0,0,1,5,7.43V152A104.58,104.58,0,0,0,192.8,165.12Z" opacity="0.2"></path><path d="M235.5,216.81c-22.56-11-35.5-34.58-35.5-64.8V134.73a15.94,15.94,0,0,0-10.09-14.87L165,110a8,8,0,0,1-4.48-10.34l21.32-53a28,28,0,0,0-16.1-37,28.14,28.14,0,0,0-35.82,16,.61.61,0,0,0,0,.12L108.9,79a8,8,0,0,1-10.37,4.49L73.11,73.14A15.89,15.89,0,0,0,55.74,76.8C34.68,98.45,24,123.75,24,152a111.45,111.45,0,0,0,31.18,77.53A8,8,0,0,0,61,232H232a8,8,0,0,0,3.5-15.19ZM67.14,88l25.41,10.3a24,24,0,0,0,31.23-13.45l21-53c2.56-6.11,9.47-9.27,15.43-7a12,12,0,0,1,6.88,15.92L145.69,93.76a24,24,0,0,0,13.43,31.14L184,134.73V152c0,.33,0,.66,0,1L55.77,101.71A108.84,108.84,0,0,1,67.14,88Zm48,128a87.53,87.53,0,0,1-24.34-42,8,8,0,0,0-15.49,4,105.16,105.16,0,0,0,18.36,38H64.44A95.54,95.54,0,0,1,40,152a85.9,85.9,0,0,1,7.73-36.29l137.8,55.12c3,18,10.56,33.48,21.89,45.16Z"></path></svg>
                        </button>
                        <button
                            className="modal_close_btn re"
                            onClick={() => onClose(false)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                            >
                                <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                {
                    !historyState && (
                        <InlineMessageBox
                            message={t("logs.logging_disabled")}
                            type={1}
                        />
                    )
                }

                <div className="logs_box">
                    {logs.length === 0 ? (
                        <div className="no_log_box">
                            <span className="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" viewBox="0 0 256 256"><path d="M232,56V200a16,16,0,0,1-16,16h-8l-16-16-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56Z" opacity="0.2"></path><path d="M192,144H64a8,8,0,0,1,0-16H192a8,8,0,0,1,0,16Zm40-64H24a8,8,0,0,0,0,16H232a8,8,0,0,0,0-16ZM128,176H104a8,8,0,0,0,0,16h24a8,8,0,0,0,0-16Zm93.66-5.66a8,8,0,0,0-11.32,0L192,188.69l-18.34-18.35a8,8,0,0,0-11.32,11.32L180.69,200l-18.35,18.34a8,8,0,0,0,11.32,11.32L192,211.31l18.34,18.35a8,8,0,0,0,11.32-11.32L203.31,200l18.35-18.34A8,8,0,0,0,221.66,170.34Z"></path></svg>
                            </span>
                            <p>{t("logs.no_log")}</p>
                        </div>
                    ) : (
                        <>
                            <ul className="logs_list">
                                {currentLogs.map((log) => (
                                    <li key={log.id} className="log_item">
                                        <div className="log_btn_box">
                                            <button
                                                className="log_btn re"
                                                onClick={() => handleDeleteLogs(log.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56Z" opacity="0.2"></path><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
                                                {t("logs.delete_log")}
                                            </button>
                                        </div>
                                        <div>
                                            <b>{t("logs.table.status")}</b>
                                            <span
                                                className={`status ${log.status === 'success' ? 'success' : log.status === 'canceled' ? 'canceled' : log.status === 'fail' ? 'error' : ''}`}
                                            >
                                                {log.status === 'success' ? t('logs.table.success') : log.status === 'canceled' ? t('logs.table.canceled') : log.status === 'fail' ? t('logs.table.fail') : ''}
                                            </span>
                                        </div>
                                        <div><b>{t("logs.table.time")}</b> <p>{new Date(log.timestamp).toLocaleString()}</p></div>
                                        {(log.status !== "canceled" && (table !== "etext_logs" && table !== "dtext_logs")) ? (
                                            <>
                                                <div><b>{t("logs.table.input")}</b> <p>{log.input_path}</p></div>
                                                <div><b>{t("logs.table.output")}</b> <p>{log.output_path}</p></div>
                                                <div><b>{t("logs.table.size")}</b> <p>
                                                    {
                                                        (() => {
                                                            if (log.output_size === null) return "0B";
                                                            if (typeof log.output_size !== "number") return "";
                                                            
                                                            const size = log.output_size;
                                                            console.log(size);

                                                            if (size >= 1024 * 1024 * 1024) {
                                                                return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
                                                            } else if (size >= 1024 * 1024) {
                                                                return (size / (1024 * 1024)).toFixed(2) + " MB";
                                                            } else if (size >= 1024) {
                                                                return (size / 1024).toFixed(2) + " KB";
                                                            } else {
                                                                return size + " B";
                                                            }
                                                        })()
                                                    }
                                                </p></div>
                                            </>
                                        ) : ('')}
                                        <div><b>{t("logs.table.algo")}</b> <p className="algo">{log.algorithm}</p></div>
                                        <div><b>{t("logs.table.duration")}</b> <p>{log.duration || 0}ms</p></div>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
                <div className="logs_pagination">
                    <button
                        className="re"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M232,184a8,8,0,0,1-16,0A88,88,0,0,0,65.78,121.78L43.4,144H88a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V88a8,8,0,0,1,16,0v44.77l22.48-22.33A104,104,0,0,1,232,184Z"></path></svg>
                    </button>
                    <span className="pages_count">{currentPage}/{totalPages}</span>
                    <button
                        className="re"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M240,88v64a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h44.6l-22.36-22.21A88,88,0,0,0,40,184a8,8,0,0,1-16,0,104,104,0,0,1,177.54-73.54L224,132.77V88a8,8,0,0,1,16,0Z"></path></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;