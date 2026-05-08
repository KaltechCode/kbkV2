import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SCRIPT_ID = "ghl-chat-widget-script";
const WIDGET_TAG = "chat-widget";

const ChatWidget = () => {
  const location = useLocation();
  const isExcluded = location.pathname === "/contact";

  useEffect(() => {
    if (isExcluded) {
      // Remove script and rendered widget if present
      document.getElementById(SCRIPT_ID)?.remove();
      document.querySelectorAll(WIDGET_TAG).forEach((el) => el.remove());
      return;
    }

    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://widgets.leadconnectorhq.com/loader.js";
    script.async = true;
    script.setAttribute(
      "data-resources-url",
      "https://widgets.leadconnectorhq.com/chat-widget/loader.js"
    );
    script.setAttribute("data-widget-id", "69f811469b18587a70a348ec");
    script.setAttribute("data-source", "WEB_USER");
    document.body.appendChild(script);
  }, [isExcluded]);

  return null;
};

export default ChatWidget;