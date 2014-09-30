<%@ Page Language="C#" AutoEventWireup="true" CodeFile="designer.aspx.cs" 
         Inherits="Satec.eXpertPowerPlus.Web.Designer" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html>
	<head runat="server">

		<title></title>
		
		<script type="text/javascript" src="libs/jq.js"></script>
		<script type="text/javascript" src="libs/multisortable.js"></script>
		<script type="text/javascript" src="libs/helpers.js"></script>
		<script type="text/javascript" src="libs/spectrum.js"></script>
		<script type="text/javascript" src="libs/fileSaver.js"></script>
		<script type="text/javascript" src="libs/toBlob.js"></script>
		<script type="text/javascript" src="libs/parseColor.js"></script>
		<script type="text/javascript" src="libs/thumbnailer.js"></script>
		<script type="text/javascript" src="libs/popup.js"></script>
		<script type="text/javascript" src="libs/mustache.js"></script>

		<script type="text/javascript" src="system/base.js"></script>
		<script type="text/javascript" src="system/init.js"></script>
		<script type="text/javascript" src="system/menu.js"></script>
		<script type="text/javascript" src="system/toolbar.js"></script>
		<script type="text/javascript" src="system/toolbox.js"></script>
		<script type="text/javascript" src="system/sidebar.js"></script>
		<script type="text/javascript" src="system/ui.js"></script>
		<script type="text/javascript" src="system/events.js"></script>
		<script type="text/javascript" src="system/render.js"></script>
		<script type="text/javascript" src="system/file.js"></script>
		<script type="text/javascript" src="system/history.js"></script>
		<script type="text/javascript" src="system/functions.js"></script>
		<script type="text/javascript" src="system/actions.js"></script>
		<script type="text/javascript" src="system/helpers.js"></script>

		<!-- <script type="text/javascript" src="designer.js"></script> -->

		<script type="text/javascript">

		$(document).ready(function()
		{

			setTimeout(function()
			{

				designer.init({
					name    : getString("UntitledProject"),
				    width   : 1024,
					height  : 253,
					modules : ['templateEditor'<% if(isAdmin) { %>,'templateEditorAdmin' <% } %>]
				});

			},20);
			
		});

		</script>

		<link rel="stylesheet" type="text/css" href="css/spectrum.css">
		<link rel="stylesheet" type="text/css" href="css/designer.css">
		<link rel="stylesheet" type="text/css" href="css/popup.css">

	</head>
	<body class="<%=SessionHandler.Direction %>">

		<input type="file" id="files" name="file" />

		<div class="mainMenu"></div>

		<div class="toolbar box">
			<div class="item"><%=Resources.Strings.Box %></div>
			<div class="sep"></div>
			<div class="item">X <input type="text" class="startX" /> &nbsp;Y <input type="text" class="startY" /></div>
			<div class="sep"></div>
			<div class="item">W <input type="text" class="width" /><span class="link"></span>H <input type="text" class="height" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Radius %> <input type="text" class="radius" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Fill %> <input type="text" class="fill" data="string" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			
			<!-- <div class="sep"></div>
			<div class="item"><div class="smallButton" id="boxCreate">Create</div></div> -->
			<div class="clear"></div>
		</div>

		<div class="toolbar text hidden">
			<div class="item"><%=Resources.Strings.Text %></div>
			<div class="sep"></div>
			<div class="item">X <input type="text" class="startX" /> &nbsp;Y <input type="text" class="startY" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Font %> 
				<select class="font" data="string">
					<option value="arial">Arial</option>
					<option value="arial black">Arial Black</option>
					<option value="comic sans ms">Comic Sans Ms</option>
					<option value="courier">Courier</option>
					<option value="cursive">Cursive</option>
					<option value="fantasy">Fantasy</option>
					<option value="georgia">Georgia</option>
					<option value="helvetica">Helvetica</option>
					<option value="impact">Impact</option>
					<option value="lucida console">Lucida Console</option>
					<option value="marlett">Marlett - Symbols</option>
					<option value="mekanik let">Mekanik Let</option>
					<option value="monospace">Monospace</option>
					<option value="sans-serif">Sans Serif</option>
					<option value="symbol">Symbol</option>
					<option value="tahoma">Tahoma</option>
					<option value="times new roman">Times New Roman</option>
					<option value="trebuchet ms">Trebuchet ms</option>
					<option value="verdana">Verdana</option>
					<option value="webdings">Webdings</option>
					<option value="wingdings">Wingdings</option>
				</select> &nbsp; <%=Resources.Strings.Size %> <input type="text" class="fontSize" value="30" /> &nbsp; <%=Resources.Strings.Bold %> <input type="checkbox" class="isBold"/> &nbsp; <%=Resources.Strings.Italic %> <input type="checkbox" class="isItalic"/></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Fill %> <input type="text" class="fillStyle" data="string" /></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.Stroke %> <input type="text" class="lineWidth" /> &nbsp;<%=Resources.Strings.Color %> <input type="text" class="strokeStyle" data="string" /></div>
			<div class="clear"></div>
		</div>

		<div class="toolbar select hidden">
			<div class="item"><%=Resources.Strings.Select %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.ClickOrDragToSelect%></div>
			<div class="clear"></div>
		</div>

		<div class="toolbar selectMultiple hidden">
			<div class="item"><%=Resources.Strings.Select %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.MultipleSelected %></div>
			<div class="sep"></div>
			<div class="item">
				<div class="toolbarButton align alignRight"   type="Right"></div>
				<div class="toolbarButton align alignLeft"    type="Left"></div>
				<div class="toolbarButton align alignBottom"  type="Bottom"></div>
				<div class="toolbarButton align alignTop"     type="Top"></div>
				<div class="toolbarButton align alignMiddleV" type="MiddleV"></div>
				<div class="toolbarButton align alignMiddleH" type="MiddleH"></div>
				<div class="toolbarButton align alignCenter"  type="Center"></div>
			</div>
			<div class="clear"></div>
		</div>

		<div class="toolbar move hidden">
			<div class="item"><%=Resources.Strings.Move %></div>
			<div class="sep"></div>
			<div class="item"><input type="checkbox" id="selectAndMove" /> <%=Resources.Strings.SelectAndMove %></div>
			<div class="clear"></div>
		</div>

		<div class="toolbar transform hidden">
			<div class="item"><%=Resources.Strings.Transform %></div>
			<div class="sep"></div>
			<div class="item"><%=Resources.Strings.ClickToTransform%></div>
			<div class="clear"></div>
		</div>

		<div class="stage">
			<canvas id="canvas"></canvas>
			<canvas id="gridCanvas"></canvas>
		</div>

		<div class="tools">
			<div class="button select active" id="select"></div>
			<div class="button move" id="move"></div>
			<div class="button box" id="box"></div>
			<div class="button text" id="text"></div>
			<!-- <div class="button transform"  id="transform"></div> -->
		</div>

		<div class="sideBar"></div>

		<div class="clear"></div>

		<div id="resourcesData" class="hidden"></div>

		<!-- TEMPLATES -->
		<div id="ceTemplates" class="hidden">
			<!-- Resources toolbox item -->
			<div class="resourceItem dropItem">
				<div class="left resourceDisplay dropItem">
					<span class="helper"></span>
					<img class="resourceImage dropItem" />
				</div>
				<div class="left resourceName dropItem">{{name}}</div>
				<div class="clear"></div>
			</div>
			<!-- Objects toolbox item -->
			<div class="objectsItem {{#selected}}selected{{/selected}}" objectid="{{id}}">
				<div class="left objectName">{{title}}</div>
				<div class="right objectLock {{^locked}}unlocked{{/locked}}"></div>
				<div class="right objectVisible {{^visible}}invisible{{/visible}}"></div>
				<div class="clear"></div>
			</div>
			
		</div>

		<div class="hidden">
			<canvas id="helperCanvas"></canvas>
		</div>

		<!-- STRING RESOURCES (localization) -->
		<div id="stringResources" class="hidden">
			<string resource="HelloCanvas"     value="<%=Resources.Strings.HelloCanvas %>"></string>
			<string resource="NoResources"     value="<%=Resources.Strings.DragAddToProject %>"></string>
			<string resource="UntitledProject" value="<%=Resources.Strings.UntitledProject %>"></string>
			<string resource="NewProject"      value="<%=Resources.Strings.NewProject %>"></string>
			<string resource="Create"          value="<%=Resources.Strings.Create %>"></string>
			<string resource="Cancel"          value="<%=Resources.Strings.Cancel %>"></string>
			<string resource="ProjectName"     value="<%=Resources.Strings.ProjectName %>"></string>
			<string resource="CanvasSize"      value="<%=Resources.Strings.CanvasSize %>"></string>
			<string resource="FullScreen"      value="<%=Resources.Strings.FullScreen %>"></string>
			<string resource="file"            value="<%=Resources.Strings.File %>"></string>
			<string resource="new"             value="<%=Resources.Strings.New %>"></string>
			<string resource="save"            value="<%=Resources.Strings.SaveAs2 %>"></string>
			<string resource="save2"           value="<%=Resources.Strings.Save %>"></string>
			<string resource="load"            value="<%=Resources.Strings.Load %>"></string>
			<string resource="exportHtml"      value="<%=Resources.Strings.ExportHtml %>"></string>
			<string resource="exportSvg"       value="<%=Resources.Strings.ExportSvg %>"></string>
			<string resource="exportPng"       value="<%=Resources.Strings.ExportPng %>"></string>
			<string resource="edit"            value="<%=Resources.Strings.Edit2 %>"></string>
			<string resource="undo"            value="<%=Resources.Strings.Undo %>"></string>
			<string resource="redo"            value="<%=Resources.Strings.Redo %>"></string>
			<string resource="copy"            value="<%=Resources.Strings.Copy %>"></string>
			<string resource="paste"           value="<%=Resources.Strings.Paste %>"></string>
			<string resource="selectAll"       value="<%=Resources.Strings.SelectAll %>"></string>
			<string resource="delete"          value="<%=Resources.Strings.Delete %>"></string>
			<string resource="bringToFront"    value="<%=Resources.Strings.BringToFront %>"></string>
			<string resource="sendToBack"      value="<%=Resources.Strings.SendToBack %>"></string>
			<string resource="view"            value="<%=Resources.Strings.View %>"></string>
			<string resource="grid"            value="<%=Resources.Strings.Grid2 %>"></string>
			<string resource="objects"         value="<%=Resources.Strings.Objects %>"></string>
			<string resource="resources"       value="<%=Resources.Strings.Resources %>"></string>
			<string resource="visible"         value="<%=Resources.Strings.Visible %>"></string>
			<string resource="snap"            value="<%=Resources.Strings.Snap %>"></string>
			<string resource="size"            value="<%=Resources.Strings.Size %>"></string>
			<string resource="lineWidth"       value="<%=Resources.Strings.LineWidth %>"></string>
			<string resource="style"           value="<%=Resources.Strings.Style %>"></string>
			<string resource="text"            value="<%=Resources.Strings.Text %>"></string>
			<string resource="transform"       value="<%=Resources.Strings.Transform %>"></string>
			<string resource="rotate"          value="<%=Resources.Strings.Rotate %>"></string>
			<string resource="shadow"          value="<%=Resources.Strings.Shadow %>"></string>
			<string resource="fx"              value="FX"></string>
			<string resource="color"           value="<%=Resources.Strings.Color %>"></string>
			<string resource="blur"            value="<%=Resources.Strings.Blur %>"></string>
			<string resource="offsetX"         value="<%=Resources.Strings.Offset %> X"></string>
			<string resource="offsetY"         value="<%=Resources.Strings.Offset %> Y"></string>

			<!-- Template Editor -->
			<string resource="LoadingTemplates" value="<%=Resources.Strings.LoadingTemplates %>"></string>
			<string resource="dynamicField"     value="<%=Resources.Strings.Field %>"></string>
			<string resource="templates"        value="<%=Resources.Strings.Templates %>"></string>
			<string resource="header"           value="<%=Resources.Strings.TopHeader %>"></string>
			<string resource="footer"           value="<%=Resources.Strings.Footer %>"></string>
			<string resource="title"            value="<%=Resources.Strings.Title %>"></string>
			<string resource="type"             value="<%=Resources.Strings.Type %>"></string>
			<string resource="active"           value="<%=Resources.Strings.Active %>"></string>
			<string resource="unsavedData"      value="<%=Resources.Strings.UnsavedDataWillbeLostDoYouWantToContinue %>"></string>
			<string resource="CreateATemplate"  value="<%=Resources.Strings.CreateATemplate %>"></string>
			<string resource="SelectADesign"    value="<%=Resources.Strings.SelectADesign %>"></string>
			<string resource="FirstTimeUsing"   value="<%=Resources.Strings.FirstTimeUsing %>"></string>
			<string resource="Height"           value="<%=Resources.Strings.Height %>"></string>
			<string resource="Continue"         value="<%=Resources.Strings.Continue2 %>"></string>
			<string resource="TemplateName"     value="<%=Resources.Strings.TemplateName %>"></string>
			<string resource="UntitledTemplate" value="<%=Resources.Strings.UntitledTemplate %>"></string>
			<string resource="Customizable"     value="<%=Resources.Strings.Customizable %>"></string>	
			<string resource="Back"             value="<%=Resources.Strings.Back %>"></string>
			<string resource="AreYouSure"       value="<%=Resources.Strings.AreYouSure %>"></string>
			<string resource="DeleteTemplate"   value="<%=Resources.Strings.AreYouSureDeleteTemplate %>"></string>
			<string resource="Loading"   		value="<%=Resources.Strings.Loading %>"></string>
			<string resource="Saving"   		value="<%=Resources.Strings.Saving %>"></string>
			<string resource="SuccessfullySaved"value="<%=Resources.Strings.SuccessfullySaved %>"></string>
			<string resource="Close"            value="<%=Resources.Strings.Close %>"></string>
			<string resource="Preview"          value="<%=Resources.Strings.Preview %>"></string>
			<string resource="MakeStaticText"   value="<%=Resources.Strings.MakeStaticText %>"></string>
			<string resource="MakeDynamicData"  value="<%=Resources.Strings.MakeDynamicData %>"></string>
			<string resource="MakeGlobalized"   value="<%=Resources.Strings.MakeGlobalized %>"></string>
			<string resource="GlobalText"       value="<%=Resources.Strings.GlobalText %>"></string>
			<string resource="DynamicData"      value="<%=Resources.Strings.DynamicData %>"></string>
			<string resource="ChooseLanguage"   value="<%=Resources.Strings.ChooseLanguage %>"></string>
		</div>

	</body>
</html>