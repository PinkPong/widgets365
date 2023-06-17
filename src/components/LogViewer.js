const LogViewer = ({ logs }) => {
    return (
        <div>
        <h2>Logs</h2>
        <ul>
            {logs && logs.map((log, index) => (
            <li key={index}>{log}</li>
            ))}
        </ul>
        </div>
    );
    }

export { LogViewer };
