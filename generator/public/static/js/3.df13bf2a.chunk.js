(this["webpackJsonp_react-admin-drag"]=this["webpackJsonp_react-admin-drag"]||[]).push([[3],{2489:function(e,t,n){"use strict";n.r(t);var a=n(17),r=n.n(a),c=(n(233),n(136)),u=(n(47),n(32)),i=n(29),o=n(22),l=n(5),s=(n(70),n(18)),d=n(8),b=n(6),j=n.n(b),f=n(0),O=n(14),p=n(26),m=n(25),x=(n(134),n(57)),h=(n(135),n(37)),v=(n(2503),n(2505)),g=(n(62),n(38)),y=n(27),k=n(2498),w=n(1),C=k.default.menuTarget,I=Object(O.renderTableCheckbox)(O.Table),S=Object(p.a)()((function(e){var t=e.menus,n=e.value,a=e.onChange,c=e.topId,s=e.getCheckboxProps,b=Object(y.a)(e,["menus","value","onChange","topId","getCheckboxProps"]),j=Object(f.useState)(!1),p=Object(d.a)(j,2),m=p[0],x=p[1],h=Object(f.useState)([]),v=Object(d.a)(h,2),k=v[0],S=v[1],F=Object(f.useState)([]),T=Object(d.a)(F,2),E=T[0],R=T[1],L=Object(f.useState)([]),P=Object(d.a)(L,2),V=P[0],N=P[1],_=Object(f.useState)([]),q=Object(d.a)(_,2),H=q[0],M=q[1],B=Object(f.useState)(!0),D=Object(d.a)(B,2),z=D[0],K=D[1],G=Object(f.useRef)(0),U=[{title:"\u540d\u79f0",dataIndex:"title",key:"title"},{title:"\u7c7b\u578b",dataIndex:"type",key:"type",width:100,render:function(e,t){var n;if(2===e)return"\u529f\u80fd\u6743\u9650\u7801";var a=t.target;return(null===(n=C.find((function(e){return e.value===a})))||void 0===n?void 0:n.label)||"-"}}];function J(){return Q.apply(this,arguments)}function Q(){return(Q=Object(i.a)(r.a.mark((function t(){var n;return r.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.ajax.get("/menu/queryMenus",{enabled:!0});case 2:return n=t.sent,t.abrupt("return",(n||[]).map((function(e){return Object(l.a)({},e)})));case 4:case"end":return t.stop()}}),t)})))).apply(this,arguments)}function A(){return W.apply(this,arguments)}function W(){return(W=Object(i.a)(r.a.mark((function e(){var n,a,c,u;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(x(!0),e.prev=1,e.t0=t,e.t0){e.next=7;break}return e.next=6,J();case 6:e.t0=e.sent;case 7:n=e.t0,a=n.map((function(e){return e.id})),c=Object(O.convertToTree)(n),u=Object(o.a)(a),S(c),R(c),N(a),M(u),x(!1),e.next=22;break;case 18:throw e.prev=18,e.t1=e.catch(1),x(!1),e.t1;case 22:case"end":return e.stop()}}),e,null,[[1,18]])})))).apply(this,arguments)}function X(e){var t=Object(O.filterTree)(E,(function(t){return[t.title,t.path,t.name,t.code].some((function(t){return(t||"").toLowerCase().includes(e)}))}));S(t),K(!0),M(V)}return Object(f.useEffect)((function(){Object(i.a)(r.a.mark((function e(){return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,A();case 2:case"end":return e.stop()}}),e)})))()}),[]),Object(f.useEffect)((function(){if(c){var e=Object(o.a)(E).filter((function(e){return e.id===c}));S(e)}}),[E,c]),Object(w.jsxs)(w.Fragment,{children:[Object(w.jsxs)("div",{style:{padding:8,width:"100%",display:"flex",alignItems:"center"},children:[Object(w.jsx)(g.default.Search,{style:{flex:1},allowClear:!0,placeholder:"\u8f93\u5165\u5173\u952e\u5b57\u8fdb\u884c\u641c\u7d22",onSearch:X,onChange:function(e){G.current&&clearTimeout(G.current),G.current=setTimeout((function(){return X(e.target.value)}),3e3)}}),Object(w.jsxs)(u.default,{type:"text",style:{flex:0,marginLeft:8},onClick:function(){var e=z?[]:V;K(!z),M(e)},children:["\u5168\u90e8",z?"\u6536\u8d77":"\u5c55\u5f00"]})]}),Object(w.jsx)(I,Object(l.a)({expandable:{expandedRowKeys:H,onExpandedRowsChange:function(e){return M(e)}},rowSelection:{getCheckboxProps:s,selectedRowKeys:n,onChange:a},loading:m,columns:U,dataSource:k,pagination:!1,rowKey:"id",size:"small"},b))]})})),F=Object(p.a)({modal:{title:function(e){return e.isEdit?"\u7f16\u8f91\u89d2\u8272":"\u521b\u5efa\u89d2\u8272"},width:"70%",top:50}})((function(e){var t=e.record,n=e.isEdit,a=e.onOk,c=Object(f.useState)(!1),u=Object(d.a)(c,2),o=u[0],b=u[1],j=s.default.useForm(),p=Object(d.a)(j,1)[0],g=Object(O.useOptions)(k.default.system),y=Object(d.a)(g,1)[0];e.ajax.useGet("/role/getRoleDetailById",{id:null===t||void 0===t?void 0:t.id},[],{setLoading:b,mountFire:n,formatResult:function(e){if(e){var t=Object(l.a)({},e);p.setFieldsValue(t)}}});var C=e.ajax.usePost("/role/addRole",null,{setLoading:b,successTip:"\u521b\u5efa\u6210\u529f\uff01"}).run,I=e.ajax.usePost("/role/updateRoleById",null,{setLoading:b,successTip:"\u4fee\u6539\u6210\u529f\uff01"}).run,F=e.ajax.useGet("/role/getOneRole").run;function T(){return(T=Object(i.a)(r.a.mark((function e(t){var c;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(c=Object(l.a)({},t),!n){e.next=6;break}return e.next=4,I(c);case 4:e.next=8;break;case 6:return e.next=8,C(c);case 8:a();case 9:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var E=Object(O.useDebounceValidator)(function(){var e=Object(i.a)(r.a.mark((function e(t,a){var c,u,i;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a){e.next=2;break}return e.abrupt("return");case 2:return c=p.getFieldValue("systemId"),e.next=5,F({name:a,systemId:c});case 5:if(u=e.sent){e.next=8;break}return e.abrupt("return");case 8:if(i=p.getFieldValue("id"),!n||u.id===i||u.name!==a){e.next=11;break}throw Error("\u89d2\u8272\u540d\u4e0d\u80fd\u91cd\u590d\uff01");case 11:if(n||u.name!==a){e.next=13;break}throw Error("\u89d2\u8272\u540d\u4e0d\u80fd\u91cd\u590d\uff01");case 13:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}()),R={labelCol:{flex:"100px"}},L={xs:{span:24},sm:{span:12}};return Object(w.jsx)(s.default,{form:p,name:"roleEdit",onFinish:function(e){return T.apply(this,arguments)},initialValues:{enabled:!0},children:Object(w.jsxs)(O.ModalContent,{loading:o,okText:"\u4fdd\u5b58",okHtmlType:"submit",cancelText:"\u91cd\u7f6e",onCancel:function(){return p.resetFields()},children:[n?Object(w.jsx)(O.FormItem,{hidden:!0,name:"id"}):null,Object(w.jsxs)(x.default,{gutter:8,children:[Object(w.jsx)(h.default,Object(l.a)(Object(l.a)({},L),{},{children:Object(w.jsx)(v.default,{title:"\u57fa\u7840\u4fe1\u606f",children:Object(w.jsxs)(O.Content,{fitHeight:!0,otherHeight:160,children:[m.j?Object(w.jsx)(O.FormItem,Object(l.a)(Object(l.a)({},R),{},{label:"\u5f52\u5c5e\u7cfb\u7edf",name:"systemId",required:!0,options:y,onChange:function(){p.setFieldsValue({menuIds:[]})},noSpace:!0})):null,Object(w.jsx)(O.FormItem,Object(l.a)(Object(l.a)({},R),{},{label:"\u89d2\u8272\u540d\u79f0",name:"name",required:!0,noSpace:!0,maxLength:50,rules:[{validator:E}]})),Object(w.jsx)(O.FormItem,Object(l.a)(Object(l.a)({},R),{},{type:"switch",label:"\u542f\u7528",name:"enabled",checkedChildren:"\u542f",unCheckedChildren:"\u7981",required:!0})),Object(w.jsx)(O.FormItem,Object(l.a)(Object(l.a)({},R),{},{type:"textarea",label:"\u5907\u6ce8",name:"remark",maxLength:250}))]})})})),Object(w.jsx)(h.default,Object(l.a)(Object(l.a)({},L),{},{children:Object(w.jsx)(v.default,{title:"\u6743\u9650\u914d\u7f6e",bodyStyle:{padding:0},children:Object(w.jsx)(O.FormItem,{shouldUpdate:!0,noStyle:!0,children:function(e){var t=(0,e.getFieldValue)("systemId");return Object(w.jsx)(O.FormItem,Object(l.a)(Object(l.a)({},R),{},{name:"menuIds",children:Object(w.jsx)(S,{topId:m.j?t:void 0,fitHeight:!0,otherHeight:200})}))}})})}))]})]})})})),T=n(2513),E=n.n(T);t.default=Object(p.a)({path:"/roles"})((function(e){var t=Object(f.useState)(!1),n=Object(d.a)(t,2),a=n[0],b=n[1],p=Object(f.useState)(1),x=Object(d.a)(p,2),h=x[0],v=x[1],g=Object(f.useState)(20),y=Object(d.a)(g,2),C=y[0],I=y[1],S=Object(f.useState)({}),T=Object(d.a)(S,2),R=T[0],L=T[1],P=Object(f.useState)(null),V=Object(d.a)(P,2),N=V[0],_=V[1],q=Object(f.useState)(!1),H=Object(d.a)(q,2),M=H[0],B=H[1],D=s.default.useForm(),z=Object(d.a)(D,1)[0],K=Object(f.useMemo)((function(){return Object(l.a)(Object(l.a)({},R),{},{pageNum:h,pageSize:C})}),[R,h,C]),G=function(){return L(z.getFieldsValue())},U=e.ajax.useGet("/role/queryRoleByPage",K,[K],{setLoading:b,formatResult:function(e){return{dataSource:((null===e||void 0===e?void 0:e.content)||[]).filter((function(e){return 3===e.type})),total:(null===e||void 0===e?void 0:e.totalElements)||0}}}).data,J=(U=void 0===U?{}:U).dataSource,Q=U.total,A=e.ajax.useDel("/role/:id",null,{setLoading:b,successTip:"\u5220\u9664\u6210\u529f\uff01"}).run,W=[{title:"\u89d2\u8272\u540d\u79f0",dataIndex:"name"},{title:"\u542f\u7528",dataIndex:"enabled",render:function(e){return k.default.enabled.getTag(!!e)}},{title:"\u5907\u6ce8",dataIndex:"remark"},{title:"\u64cd\u4f5c",dataIndex:"operator",width:100,render:function(e,t){var n=t.id,a=t.name,r=[{label:"\u7f16\u8f91",onClick:function(){return _(t)||B(!0)}},{label:"\u5220\u9664",color:"red",confirm:{title:"\u60a8\u786e\u5b9a\u5220\u9664\u300c".concat(a,"\u300d\u5417\uff1f"),onConfirm:function(){return function(e){return X.apply(this,arguments)}(n)}}}];return Object(w.jsx)(O.Operator,{items:r})}}];function X(){return(X=Object(i.a)(r.a.mark((function e(t){return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,A(t);case 2:G();case 3:case"end":return e.stop()}}),e)})))).apply(this,arguments)}m.j&&(W=[{title:"\u5f52\u5c5e\u7cfb\u7edf",dataIndex:"systemName"}].concat(Object(o.a)(W)));return Object(w.jsxs)(O.PageContent,{fitHeight:!0,loading:a,className:j()(E.a.root),children:[Object(w.jsx)(O.QueryBar,{children:Object(w.jsxs)(s.default,{name:"role",layout:"inline",form:z,initialValues:R,onFinish:function(e){v(1),L(e)},children:[Object(w.jsx)(O.FormItem,Object(l.a)(Object(l.a)({},{wrapperCol:{style:{width:200}}}),{},{label:"\u89d2\u8272\u540d\u79f0",name:"name"})),Object(w.jsx)(O.FormItem,{children:Object(w.jsxs)(c.default,{children:[Object(w.jsx)(u.default,{type:"primary",htmlType:"submit",children:"\u67e5\u8be2"}),Object(w.jsx)(u.default,{htmlType:"reset",children:"\u91cd\u7f6e"})]})})]})}),Object(w.jsx)(O.ToolBar,{children:Object(w.jsx)(u.default,{type:"primary",onClick:function(){return _(null)||B(!0)},children:"\u6dfb\u52a0"})}),Object(w.jsx)(O.Table,{fitHeight:!0,dataSource:J,columns:W,rowKey:"id"}),Object(w.jsx)(O.Pagination,{total:Q,pageNum:h,pageSize:C,onPageNumChange:v,onPageSizeChange:function(e){return v(1)||I(e)}}),Object(w.jsx)(F,{visible:M,isEdit:!!N,record:N,onOk:function(){return B(!1)||G()},onCancel:function(){return B(!1)}})]})}))},2498:function(e,t,n){"use strict";n.r(t);var a=n(8),r=n(14),c={},u=n(2499);u.keys().forEach((function(e){if(!["./index.js"].includes(e)){var t=u(e).default;Object.entries(t).forEach((function(t){var n=Object(a.a)(t,2),r=n[0],u=n[1];if(r in c)throw Error("".concat(e," \u6587\u4ef6\u4e2d key \u300c").concat(r,"\u300d\u5df2\u88ab\u4f7f\u7528\uff01\u8bf7\u66f4\u6362\uff01"));c[r]=u}))}})),Object(r.wrapperOptions)(c,5e3),t.default=c},2499:function(e,t,n){var a={"./index.js":2498,"./system.js":2500};function r(e){var t=c(e);return n(t)}function c(e){if(!n.o(a,e)){var t=new Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t}return a[e]}r.keys=function(){return Object.keys(a)},r.resolve=c,e.exports=r,r.id=2499},2500:function(e,t,n){"use strict";n.r(t);var a=n(17),r=n.n(a),c=n(29),u=(n(436),n(2501)),i=n(188),o=n(1);t.default={menuTarget:[{value:"menu",label:"\u5e94\u7528\u83dc\u5355"},{value:"qiankun",label:"\u4e7e\u5764\u5b50\u5e94\u7528"},{value:"iframe",label:"iframe\u5185\u5d4c\u7b2c\u4e09\u65b9"},{value:"_self",label:"\u5f53\u524d\u7a97\u53e3\u6253\u5f00\u7b2c\u4e09\u65b9"},{value:"_blank",label:"\u65b0\u5f00\u7a97\u53e3\u6253\u5f00\u7b2c\u4e09\u65b9"}],yesNo:[{value:!0,label:"\u662f",tag:Object(o.jsx)(u.default,{color:"green",children:"\u662f"})},{value:!1,label:"\u5426",tag:Object(o.jsx)(u.default,{color:"red",children:"\u5426"})}],enabled:[{value:!0,label:"\u542f\u7528",tag:Object(o.jsx)(u.default,{color:"green",children:"\u542f\u7528"})},{value:!1,label:"\u7981\u7528",tag:Object(o.jsx)(u.default,{color:"red",children:"\u7981\u7528"})}],sex:[{value:"1",label:"\u7537"},{value:"2",label:"\u5973"},{value:"3",label:"\u672a\u77e5"}],system:function(){return Object(c.a)(r.a.mark((function e(){var t;return r.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,i.b.get("/menu/queryTopMenus");case 2:return t=e.sent,e.abrupt("return",t.map((function(e){return{value:e.id,label:e.title,meta:e}})));case 4:case"end":return e.stop()}}),e)})))()},action:function(){return[{value:"add",label:"\u6dfb\u52a0"}]},get demo(){return[]}}},2501:function(e,t,n){e.exports=n(11)(441)},2503:function(e,t,n){"use strict";n(30),n(2504),n(296),n(134),n(135)},2504:function(e,t,n){},2505:function(e,t,n){e.exports=n(11)(954)},2513:function(e,t,n){var a=n(28),r=n(2514);"string"===typeof(r=r.__esModule?r.default:r)&&(r=[[e.i,r,""]]);var c={insert:"head",singleton:!1};a(r,c);e.exports=r.locals||{}},2514:function(e,t,n){"use strict";n.r(t);var a=n(16),r=n.n(a)()(!0);r.push([e.i,"","",{version:3,sources:[],names:[],mappings:"",sourceRoot:""}]),t.default=r}}]);
//# sourceMappingURL=3.df13bf2a.chunk.js.map