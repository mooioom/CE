using System.Collections.Generic;
using System.Data;
using System.Web.Services;
using System;
using Satec.eXpertPower.Utilities;
using System.Web.Script.Serialization;
using System.Data.SqlClient;
using Satec.eXpertPowerPlus.BL;
using HtmlAgilityPack;
using System.Linq;

namespace Satec.eXpertPowerPlus.Web
{
    public partial class api : AbstractEnergyPage
    {
        private static SessionHandler sessionHandler = new SessionHandler();
        private static JavaScriptSerializer js       = new JavaScriptSerializer();
        private static DBUtils dbUtils               = new DBUtils();
        
        // <invoiceLayout.aspx>
        // --------------------
        [WebMethod]
        public static object initLayout()
        {
            return js.Serialize(new BillTemplateBL(sessionHandler.LangID).initLayout(sessionHandler.CustomerID));
        }

        [WebMethod]
        public static object getTemplateData(string type, int id, int isAudited)
        {
            js.MaxJsonLength = Int32.MaxValue;
            DataTable dt = new BillTemplateBL(sessionHandler.LangID).getTemplateData(sessionHandler.CustomerID, type, id, isAudited);

            if (dt.Rows.Count == 1 && (type=="header"||type=="footer")) 
            {

                //stub
                DataTable dynamicData = new DataTable();

                dynamicData.Columns.Add("Property", typeof(string));
                dynamicData.Columns.Add("Value", typeof(string));

                dynamicData.Rows.Add("computationNumber", "54397");
                dynamicData.Rows.Add("customerName", Resources.Strings.CustomerName);
                dynamicData.Rows.Add("addressForBill", Resources.Strings.AddressforBill);
                dynamicData.Rows.Add("computationNumber", "54397");
                dynamicData.Rows.Add("deviceName", "11754-BFM136-05");
                dynamicData.Rows.Add("siteName", Resources.Strings.SiteName);
                dynamicData.Rows.Add("methodOfCharge", "TOU Import");
                dynamicData.Rows.Add("invoiceDate", "July 2014");
                dynamicData.Rows.Add("noDaysInPeriod", "13");
                dynamicData.Rows.Add("meteringPeriodFrom", "6/30/2014");
                dynamicData.Rows.Add("meteringPeriodTo", "7/13/2014");
                dynamicData.Rows.Add("billingMonth", "7/31/2014");
                dynamicData.Rows.Add("meterNumber", "1002082-5");

                dt.Rows[0][0] = new BillTemplateBL(sessionHandler.LangID).generateHtml(sessionHandler.LangID, dt.Rows[0].ItemArray[0].ToString(), dynamicData);

            }
            List<Dictionary<string, object>> data = formatDataTable(dt);
            return js.Serialize(data);
        }

        [WebMethod]
        public static object setTemplate(string type, int id)
        {
            return js.Serialize(new { 
                success = new BillTemplateBL(sessionHandler.LangID).setTemplate(sessionHandler.CustomerID, type, id) 
            });
        }
        [WebMethod]
        public static object saveProperties(int headerOnly, int readingsTable, int barcode, string barcodeText) 
        {
            return js.Serialize(new
            {
                success = new BillTemplateBL(sessionHandler.LangID).saveProperties(sessionHandler.CustomerID, headerOnly, readingsTable, barcode, barcodeText)
            });
        }
        [WebMethod]
        public static object transformLayoutOptions(string fromHeaders, string toHeaders, string fromGrids, string toGrids, string fromFooters, string toFooters) 
        {
            //todo: dont forget to change table names
            string[] fromHeadersA = fromHeaders.Split(',');
            string[] toHeadersA   = toHeaders.Split(',');
            string[] fromGridsA   = fromGrids.Split(',');
            string[] toGridsA     = toGrids.Split(',');
            string[] fromFootersA = fromFooters.Split(',');
            string[] toFootersA   = toFooters.Split(',');

            dbUtils = new DBUtils();

            DataTable layoutOptions = new DataTable();
            var q = "select * from LayoutOptions";
            layoutOptions = dbUtils.FillDataSetTable(q, "LayoutOptions").Tables[0];

            foreach (DataRow row in layoutOptions.Rows) {
                string headerLayout = row["HeaderLayout"].ToString();
                string gridLayout   = row["GridLayout"].ToString();
                string footerLayout = row["FooterLayout"].ToString();
                int hasBarcode      = (row["HasBarcode"] != DBNull.Value) ? Convert.ToInt32(row["HasBarcode"]) : 0;
                string textToEncode = row["TextToEncode"].ToString();
                string customerId   = row["SourceID"].ToString();
                int a = 0, b = 0, c = 0, i = 0;
                i = 0; foreach (string s in fromHeadersA) {if (s == headerLayout) a = i; i++;}
                i = 0; foreach (string s in fromFootersA) {if (s == footerLayout) b = i; i++;}
                i = 0; foreach (string s in fromGridsA)   {if (s == gridLayout)   c = i; i++;}
                string qHeader     = "insert into BILLING.BillingTemplates (CustomerId,Type,DesignId) values ("+customerId+",'header',"+toHeadersA[a]+")";
                string qFooter     = "insert into BILLING.BillingTemplates (CustomerId,Type,DesignId) values (" + customerId + ",'footer'," + toFootersA[b] + ")";
                string qGrid       = "insert into BILLING.BillingTemplateGrids (CustomerId,DesignId) values (" + customerId + "," + toGridsA[c] + ")";
                string qProperties = "insert into BILLING.BillingTemplatesProperties (CustomerId,Barcode,BarcodeText) values ("+customerId+","+hasBarcode+",N'"+textToEncode+"')";
                dbUtils.ExecNonQuery(qHeader);
                dbUtils.ExecNonQuery(qFooter);
                dbUtils.ExecNonQuery(qGrid);
                dbUtils.ExecNonQuery(qProperties);
            }

            return js.Serialize(new { a = 1 });
        }
        //</invoiceLayout.aspx>

        // <Template Editor>
        // -----------------
        [WebMethod]
        public static object getTemplate(int id, string type, int isAudited)
        {
            DataTable dt = new DataTable();
            js.MaxJsonLength = Int32.MaxValue;
            if (isAudited == 0) dt = new BillTemplateBL(sessionHandler.LangID).getDesign(type, id); 
            else                dt = new BillTemplateBL(sessionHandler.LangID).getTemplate(sessionHandler.CustomerID, type);

            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }

        [WebMethod]
        public static object saveTemplate(String id, String type, String height, String data, String html)
        {
            string query = @"update BILLING.BillingTemplates 
                           SET DesignId = "+id+", Height = "+ height +", Data = N'" + data + "', Html = N'" + html + 
                           "' WHERE CustomerId=" + sessionHandler.CustomerID + " and Type = '"+type+"';";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object saveGrid(String id, String cell, String cellText, String header, String headerText, String total, String totalText, String border)
        {
            string query = @"update BILLING.BillingTemplateGrids 
                           SET Cell = @cell, CellText = '" + cellText + "', Header = '" + header + "', HeaderText = '" + headerText +
                           "', Total = '"+ total +"', TotalText = '" + totalText + "', Border = '" + border + "', DesignId = " + id + " WHERE CustomerId = " + sessionHandler.CustomerID;
            int result;
            result = dbUtils.ExecNonQuery(query, new List<System.Data.SqlClient.SqlParameter>
                {
                    new SqlParameter("cell",cell)
                });
            return js.Serialize(result);
        }

        [WebMethod]
        public static object getPreviewData()
        {
            string query = @"select Text,ID from ListOfLanguages lol
	                            join StringsText st on st.StringId = lol.StringId and Language = " + sessionHandler.LangID + @"
                             where Supported = 1";
            DataTable dt;
            dt = dbUtils.FillDataSetTable(query, "previewData").Tables[0];
            List<Dictionary<string, object>> previewData = formatDataTable(dt);
            return js.Serialize(new { previewData = previewData, langId = sessionHandler.LangID });
        }

        [WebMethod]
        public static object getHtml(int langId, string html)
        {
            //stub
            DataTable dt = new DataTable();

            dt.Columns.Add("Property", typeof(string));
            dt.Columns.Add("Value", typeof(string));
            
            dt.Rows.Add("customerName", GetString("CustomerName", langId));
            dt.Rows.Add("addressForBill", GetString("AddressforBill", langId));
            dt.Rows.Add("computationNumber", "54397");
            dt.Rows.Add("deviceName", "11754-BFM136-05");
            dt.Rows.Add("siteName", "Site Name");
            dt.Rows.Add("methodOfCharge", "TOU Import");
            dt.Rows.Add("invoiceDate", "July 2014");
            dt.Rows.Add("noDaysInPeriod", "13");
            dt.Rows.Add("meteringPeriodFrom", "6/30/2014");
            dt.Rows.Add("meteringPeriodTo", "7/13/2014");
            dt.Rows.Add("billingMonth", "7/31/2014");
            dt.Rows.Add("meterNumber", "1002082-5");

            return js.Serialize(new {
                html = new BillTemplateBL(sessionHandler.LangID).generateHtml(langId, html, dt) 
            });
        }

        [WebMethod]
        public static Object StringsByIDLang(int id)
        {
            string query = @"select 
	                        st.Text,
	                        ISNULL(st2.Text, Description) Description
                        from StringsText st 
	                        join ListOfLanguages lol on st.Language = lol.ID
	                        left join  StringsText st2 on st2.StringId = lol.StringId and st2.Language = " + sessionHandler.LangID + @"
                        where st.StringId = " + id.ToString();

            DataTable dt;

            dt = dbUtils.FillDataSetTable(query, "strings").Tables[0];
            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }
        //</Template Editor>

        //<Template Editor - Admin>
        //-------------------------
        [WebMethod]
        public static object getDesigns()
        {
            DataTable designsDt;
            js.MaxJsonLength = Int32.MaxValue;
            designsDt = dbUtils.FillDataSetTable("select * from BILLING.BillingTemplatesDesigns", "BILLING.BillingTemplatesDesigns").Tables[0];
            List<Dictionary<string, object>> designs = formatDataTable(designsDt);
            return js.Serialize(designs);
        }

        [WebMethod]
        public static object getDesign(string type, int id)
        {
            DataTable dt = new BillTemplateBL(sessionHandler.LangID).getDesign(type, id);
            List<Dictionary<string, object>> template = formatDataTable(dt);
            return js.Serialize(template);
        }

        [WebMethod]
        public static object saveDesign(String id, String data, String html)
        {
            string query = @"update BILLING.BillingTemplatesDesigns SET Data = N'" + data + "', Html = N'" + html + "' WHERE ID=" + id + ";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object setupDesign(String name, String type, String height)
        {
            string query = @"insert into BILLING.BillingTemplatesDesigns (Name,Height,Type,Data,Active) VALUES ('" + name + "'," + height + ",'" + type + "','',1);";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }

        [WebMethod]
        public static object removeDesign(String id)
        {
            string query = @"delete from BILLING.BillingTemplatesDesigns WHERE ID=" + id + ";";
            int result;
            result = dbUtils.ExecNonQuery(query);
            return js.Serialize(result);
        }
        //</Template Editor - Admin>

        public static List<Dictionary<string, object>> formatDataTable(DataTable dt)
        {
            List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
            Dictionary<string, object> row = null;
            foreach (DataRow dr in dt.Rows)
            {
                row = new Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    row.Add(col.ColumnName, dr[col]);
                }
                rows.Add(row);
            }
            return rows;
        }
    }
}
