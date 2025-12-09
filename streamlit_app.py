import streamlit as st
import os
from datetime import datetime
from notion_client import Client
import hashlib
import time

# --- 1. 配置與初始化 ---

# 假設 secrets.toml 中包含了 Notion API Key 和 Database IDs
try:
    # 連接 Notion 客戶端
    NOTION_API_KEY = st.secrets["NOTION_API_KEY"]
    USER_DB_ID = st.secrets["USER_DB_ID"]
    RECORD_DB_ID = st.secrets["RECORD_DB_ID"]
    
    notion = Client(auth=NOTION_API_KEY)
except KeyError:
    st.error("配置錯誤：請檢查您的 `.streamlit/secrets.toml` 是否包含 Notion API Key 和 DB IDs。")
    st.stop()


# --- 2. 圖像處理的核心函數 (您的 AI 邏輯放置處) ---

def add_watermark(image_file_path, watermark_text):
    """
    Placeholder: 執行為圖片加水印的操作。
    """
    st.info(f"執行加水印：{image_file_path}，文字：{watermark_text}")
    
    # === 請將您的 Google AI Studio 核心邏輯放在這裡 ===
    # 步驟 1: 讀取 image_file_path
    # 步驟 2: 呼叫您的 AI 模型 / API (您調整好的 Prompt 邏輯)
    # 步驟 3: 將結果圖片存檔，並返回存檔路徑
    
    # 模擬延遲和成功返回
    time.sleep(1) 
    return "processed_watermark_" + os.path.basename(image_file_path)

def remove_background(image_file_path):
    """
    Placeholder: 執行圖片去背的操作。
    """
    st.info(f"執行去背：{image_file_path}")
    
    # === 請將您的 Google AI Studio 核心邏輯放在這裡 ===
    # 步驟 1: 讀取 image_file_path
    # 步驟 2: 呼叫您的 AI 模型 / API (您調整好的 Prompt 邏輯)
    # 步驟 3: 將結果圖片存檔，並返回存檔路徑
    
    # 模擬延遲和成功返回
    time.sleep(1)
    return "processed_nobg_" + os.path.basename(image_file_path)

# --- 3. Notion 數據庫操作函數 (Notion Logic) ---

# 簡化密碼 hashing 函數 (在真實應用中應使用更強大的庫如 bcrypt)
def simple_hash(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def check_login(username, password):
    """
    查詢 Notion Users 數據庫，驗證用戶名和密碼。
    返回 (user_id, is_admin) 或 None。
    """
    password_h = simple_hash(password)
    
    # 使用 Notion 過濾器篩選匹配的用戶名和密碼
    filter_query = {
        "and": [
            {"property": "Username", "rich_text": {"equals": username}},
            {"property": "Password", "rich_text": {"equals": password_h}}
        ]
    }
    
    results = notion.databases.query(database_id=USER_DB_ID, filter=filter_query)
    
    if results["results"]:
        page = results["results"][0]
        # 獲取屬性值
        user_id = page["id"]
        is_admin = page["properties"]["Is Admin"]["checkbox"]
        return user_id, is_admin
    return None

def record_operation_to_notion(user_id, op_type, filename):
    """
    向 OperationRecords 數據庫新增一條操作記錄。
    """
    now = datetime.now().isoformat()
    
    try:
        notion.pages.create(
            parent={"database_id": RECORD_DB_ID},
            properties={
                # 記錄名稱
                "Name": {"title": [{"text": {"content": f"{op_type} - {filename}"}}]},
                "User ID": {"rich_text": [{"text": {"content": user_id}}]},
                "Operation Type": {"select": {"name": op_type}},
                "Timestamp": {"date": {"start": now}},
                "Input Filename": {"rich_text": [{"text": {"content": filename}}]}
            }
        )
        return True
    except Exception as e:
        st.error(f"記錄操作到 Notion 失敗: {e}")
        return False

def get_user_history(user_id):
    """
    從 Notion 獲取該用戶的所有操作記錄。
    """
    filter_query = {
        "property": "User ID",
        "rich_text": {"equals": user_id}
    }
    
    results = notion.databases.query(
        database_id=RECORD_DB_ID, 
        filter=filter_query,
        sorts=[{"property": "Timestamp", "direction": "descending"}]
    )
    return results["results"]

# --- 4. Streamlit 應用程式流程與 UI ---

if 'logged_in' not in st.session_state:
    st.session_state.logged_in = False
    st.session_state.user_id = None
    st.session_state.is_admin = False

def render_login_page():
    st.title("用戶登入 / 註冊 🔐")
    
    with st.form("login_form"):
        username = st.text_input("用戶名 (Username)")
        password = st.text_input("密碼 (Password)", type="password")
        submitted = st.form_submit_button("登入")
        
        if submitted:
            result = check_login(username, password)
            if result:
                st.session_state.logged_in = True
                st.session_state.user_id, st.session_state.is_admin = result
                st.success("登入成功！")
                st.experimental_rerun() # 重新運行以導航到 Dashboard
            else:
                st.error("用戶名或密碼錯誤。")

def render_dashboard():
    st.sidebar.title(f"歡迎, {st.session_state.user_id[:8]}...")
    if st.session_state.is_admin:
        st.sidebar.success("您是管理員！")
        if st.sidebar.button("⚙️ 進入管理後台"):
            st.session_state.page = "admin"
            st.experimental_rerun()
            
    st.sidebar.button("登出", on_click=logout)

    st.title("🎨 Graphic Helper 核心功能")
    st.subheader("請上傳圖片並選擇操作：")
    
    uploaded_file = st.file_uploader("選擇圖片文件", type=["png", "jpg", "jpeg"])
    operation = st.radio("選擇操作:", ('加水印 (Watermark)', '去背 (Remove Background)'))
    
    if uploaded_file is not None:
        # 暫時保存檔案到本地 (Streamlit 處理上傳檔案的標準做法)
        file_details = {"FileName": uploaded_file.name}
        with open(os.path.join("temp", uploaded_file.name), "wb") as f:
            f.write(uploaded_file.getbuffer())
        file_path = os.path.join("temp", uploaded_file.name)
        
        watermark_text = st.text_input("水印文字 (僅限水印操作):", "Your Logo")
        
        if st.button("執行操作並記錄"):
            st.warning("正在處理圖片，請稍候...")
            
            if operation == '加水印 (Watermark)':
                output_path = add_watermark(file_path, watermark_text)
                op_type = "Watermark"
            else:
                output_path = remove_background(file_path)
                op_type = "Remove Background"
            
            # 記錄操作到 Notion
            if record_operation_to_notion(st.session_state.user_id, op_type, file_details["FileName"]):
                st.success(f"✅ 操作完成！結果已儲存，記錄已寫入 Notion ({output_path})。")
                
                # 顯示結果或下載連結 (Placeholder)
                st.image(file_path, caption=f"處理後的圖片 ({op_type})", use_column_width=True)

def render_history_page():
    st.title("⏳ 我的操作歷史記錄")
    st.sidebar.button("返回 Dashboard", on_click=lambda: st.session_state.update(page="dashboard"))
    
    if st.button("刷新記錄"):
        st.experimental_rerun()
        
    records = get_user_history(st.session_state.user_id)
    
    if records:
        st.dataframe([
            {
                "時間": r["properties"]["Timestamp"]["date"]["start"].split('T')[0],
                "類型": r["properties"]["Operation Type"]["select"]["name"],
                "檔案名": r["properties"]["Input Filename"]["rich_text"][0]["text"]["content"]
            }
            for r in records
        ])
    else:
        st.info("您目前沒有任何操作記錄。")

def render_admin_portal():
    st.title("🛡️ 管理員後台")
    st.sidebar.button("返回 Dashboard", on_click=lambda: st.session_state.update(page="dashboard"))
    
    if st.session_state.is_admin:
        st.header("所有用戶記錄")
        # 管理員可以直接查詢 Notion 數據庫的所有內容 (Notion API 允許)
        # 由於 Notion API 查詢需要複雜的分頁處理，這裡僅作概念展示
        st.info("管理員可以看到所有用戶的 'Users' 和 'OperationRecords' 數據庫內容，進行管理和刪除操作。")
        # Placeholder for viewing all users:
        # all_users = notion.databases.query(database_id=USER_DB_ID)
        # st.json(all_users)
    else:
        st.error("權限不足，您不是管理員。")

def logout():
    st.session_state.logged_in = False
    st.session_state.user_id = None
    st.session_state.is_admin = False
    st.session_state.page = "login"

# --- 5. 主應用程式邏輯 ---

# 創建一個臨時資料夾來儲存上傳的檔案
if not os.path.exists("temp"):
    os.makedirs("temp")

if st.session_state.logged_in:
    if "page" not in st.session_state:
        st.session_state.page = "dashboard"
        
    if st.session_state.page == "dashboard":
        render_dashboard()
        if st.sidebar.button("檢視歷史記錄"):
            st.session_state.page = "history"
            st.experimental_rerun()
    elif st.session_state.page == "history":
        render_history_page()
    elif st.session_state.page == "admin":
        render_admin_portal()

else:
    render_login_page()
