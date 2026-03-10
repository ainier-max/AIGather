/**
 * MVC中的Model层,主要用来处理逻辑，Model会有多个业务逻辑类
 */
class ModelClass {
    //参数可提取到这里
    name = "模型交流";
    messages = [];
    socket = null;
    isConnected = false;
    inputText = "";

    constructor() {
    }

    // 初始化WebSocket连接
    initWebSocket() {
        if (this.socket) {
            this.socket.close();
        }

        // WebSocket 无法通过 Vite 代理，需要直接连接后端
        // 使用当前主机的 IP，端口改为后端端口 8087
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const wsUrl = `${protocol}//${host}:8087/api/ai/chat`;

        console.log("Connecting to WebSocket:", wsUrl);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log("WebSocket connected");
            this.isConnected = true;
            this.messages.push({
                role: 'system',
                content: '已连接到大模型开发交流接口',
                time: new Date().toLocaleTimeString()
            });
        };

        this.socket.onmessage = (event) => {
            console.log("WebSocket received message:", event.data);
            
            // 如果收到结束信号，不做处理
            if (event.data === '[DONE]') {
                return;
            }

            // 检查最后一条消息是否是 AI 消息
            const lastMessage = this.messages[this.messages.length - 1];
            
            if (lastMessage && lastMessage.role === 'ai' && !lastMessage.completed) {
                // 追加到最后一条 AI 消息
                lastMessage.content += event.data;
            } else {
                // 创建新的 AI 消息
                this.messages.push({
                    role: 'ai',
                    content: event.data,
                    time: new Date().toLocaleTimeString(),
                    completed: false
                });
            }
        };

        this.socket.onclose = () => {
            console.log("WebSocket disconnected");
            this.isConnected = false;
            // 标记最后一条 AI 消息为完成
            const lastMessage = this.messages[this.messages.length - 1];
            if (lastMessage && lastMessage.role === 'ai') {
                lastMessage.completed = true;
            }
            this.messages.push({
                role: 'system',
                content: '连接已断开',
                time: new Date().toLocaleTimeString()
            });
        };

        this.socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.messages.push({
                role: 'system',
                content: '连接发生错误',
                time: new Date().toLocaleTimeString()
            });
        };
    }

    // 发送消息
    sendMessage() {
        if (!this.inputText.trim()) return;
        if (!this.isConnected) {
            this.messages.push({
                role: 'system',
                content: '未连接，无法发送消息',
                time: new Date().toLocaleTimeString()
            });
            return;
        }

        const message = {
            role: 'user',
            content: this.inputText,
            time: new Date().toLocaleTimeString()
        };

        this.messages.push(message);
        // 直接发送文本内容，不需要 JSON 格式
        this.socket.send(this.inputText);
        this.inputText = "";
    }

    // 清空消息
    clearMessages() {
        this.messages = [];
    }

    // 组件销毁前关闭连接
    dispose() {
        if (this.socket) {
            this.socket.close();
        }
    }
}
export default ModelClass
