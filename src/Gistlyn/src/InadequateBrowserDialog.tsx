import * as React from 'react';

export default class InadequateBrowserDialog extends React.Component<any, any> {
    render() {
        return (<div id="nosse" style={{
            background: "url(https://raw.githubusercontent.com/ServiceStack/Assets/master/img/livedemos/gistlyn/no-ie.jpg) no-repeat",
            backgroundSize: "cover",
            height: "100%",
            width: "100%"
        }}>
            <div id="nosse-dialog" style={{ position: "absolute", top: 20, right: 20, color: "#f7f7f7", fontSize: 24, lineHeight:"30px", maxWidth:800 }}>
                <p>
                    If you're seeing this message your browser still doesn't have native support for
                    <a href="https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events">
                        Server Sent Events (SSE)
                    </a>
                    - a simple
                    <a href="https://html.spec.whatwg.org/multipage/comms.html#server-sent-events">
                        Web Standard
                    </a>
                    supported by most modern browsers since 2011. If you would like this site to
                    work in Internet Explorer or MS Edge browsers
                    <a href="https://wpdev.uservoice.com/forums/257854-microsoft-edge-developer/suggestions/6263825-server-sent-events-eventsource">
                        vote to have them implement it.
                    </a>
                </p>

                <br />
                <p>
                    In the meantime we recommend using these better browsers below:
                </p>

                <ul style={{ listStyleType:"disc", margin:30 }}>
                    <li><a href="https://www.google.com/chrome/browser/desktop/">Chrome</a></li>
                    <li><a href="http://www.apple.com/safari/">Safari</a></li>
                    <li><a href="https://www.mozilla.org/en-US/firefox/">Firefox</a></li>
                    <li><a href="http://www.opera.com/">Opera</a></li>
                </ul>
            </div>
        </div>);
    }
} 