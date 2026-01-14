import streamlit as st
import pandas as pd

st.set_page_config(
    page_title="ASCA Operations Dashboard",
    page_icon="🛠️",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("🛠️ ASCA Operations Dashboard")

st.sidebar.header("Navigation")
page = st.sidebar.radio("Go to", ["Home", "Data Upload", "Participant Management", "Reports"])

if page == "Home":
    st.markdown("### Welcome to the ASCA Internal Operations Tool")
    st.info("Select a module from the sidebar to get started.")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.metric(label="Total Participants", value="1,234", delta="12")
    with col2:
        st.metric(label="Pending Reviews", value="56", delta="-5")
    with col3:
        st.metric(label="System Status", value="Healthy")
    
    st.markdown("---")
    st.markdown("#### Recent Activities")
    st.text("- User uploaded 'march_participants.csv' (10 mins ago)")
    st.text("- System backup completed (1 hour ago)")

elif page == "Data Upload":
    st.header("Upload Data")
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
    if uploaded_file is not None:
        try:
            data = pd.read_csv(uploaded_file)
            st.write("Data Preview:")
            st.dataframe(data.head())
            st.success("File uploaded successfully!")
        except Exception as e:
            st.error(f"Error reading file: {e}")

elif page == "Participant Management":
    st.header("Participant Management")
    st.write("Search and manage participants here.")
    
    # Placeholder for table
    st.subheader("Quick Lookup")
    search_term = st.text_input("Search by Name or ID")
    
    data = {
        'ID': [101, 102, 103, 104, 105], 
        'Name': ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'David Lee', 'Eva Green'], 
        'Status': ['Active', 'Pending', 'Active', 'Inactive', 'Active'],
        'Role': ['Member', 'Contributor', 'Member', 'Guest', 'Admin']
    }
    df = pd.DataFrame(data)
    
    if search_term:
        df = df[df['Name'].str.contains(search_term, case=False)]
    
    st.dataframe(df, use_container_width=True)

elif page == "Reports":
    st.header("Reports & Analytics")
    st.write("Generate and download reports.")
    
    report_type = st.selectbox("Select Report Type", ["Monthly Activity", "User Growth", "Financial Summary"])
    
    if st.button("Generate Report"):
        with st.spinner('Generating report...'):
            st.success(f"{report_type} generated successfully!")
            # In a real app, this would provide a download button
            st.download_button("Download CSV", data="Sample Data", file_name=f"{report_type.replace(' ', '_')}.csv")
