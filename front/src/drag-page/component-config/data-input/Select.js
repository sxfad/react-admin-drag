export default {
    isFormElement: true,
    isContainer: false,
    fields: [
        {label: '禁用', category: '状态', field: 'disabled', type: 'boolean', defaultValue: false, version: '', desc: '是否禁用'},
        {label: '加载中', category: '状态', field: 'loading', type: 'boolean', defaultValue: false, version: '', desc: '加载中状态'},
        {label: '可清除', category: '选项', field: 'allowClear', type: 'boolean', defaultValue: false, version: '', desc: '支持清除'},
        {label: '边框', category: '选项', field: 'bordered', type: 'boolean', defaultValue: true, version: '', desc: '是否有边框'},
        {label: '下拉箭头', category: '选项', field: 'showArrow', type: 'boolean', defaultValue: '单选为 true，多选为 false', version: '', desc: '是否显示下拉小箭头'},
        {label: '可搜索', category: '选项', field: 'showSearch', type: 'boolean', defaultValue: false, version: '', desc: '使单选模式可搜索'},
        {
            label: '模式', field: 'mode', type: 'radio-group', version: '',
            options: [
                {value: 'multiple', label: '多选'},
                {value: 'tags', label: '标签'},
            ],
            desc: '设置 Select 的模式为多选或标签',
        },
        // {label: '选中项后清空', appendField: {mode: ['multiple', 'tags']}, field: 'autoClearSearchValue', type: 'boolean', defaultValue: true, version: '', desc: '是否在选中项后清空搜索框，只在 mode 为 multiple 或 tags 时有效'},
        // {label: '多选清空图标', appendField: {mode: ['multiple', 'tags']}, field: 'clearIcon', type: 'ReactNode', version: '', desc: '自定义的多选框清空图标'},
        // {label: '选项删除图标', appendField: {mode: ['multiple', 'tags']}, field: 'removeIcon', type: 'ReactNode', version: '', desc: '自定义的多选框清除图标'},
        {label: '下拉项', field: 'options', type: 'options', version: '', desc: '数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能'},
        {label: '输入框提示', field: 'placeholder', type: 'string', version: '', desc: '选择框默认文本'},
        // {label: '默认高亮第一个选项', field: 'defaultActiveFirstOption', type: 'boolean', defaultValue: true, version: '', desc: '是否默认高亮第一个选项'},
        // {
        //     label: '下拉菜单宽度', field: 'dropdownMatchSelectWidth', type: [
        //         {value: 'boolean', label: '是否同宽'},
        //         {value: 'number', label: '自定义'},
        //     ],
        //     defaultValue: true,
        //     version: '',
        //     desc: '下拉菜单和选择器同宽。默认将设置 min-width，当值小于选择框宽度时会被忽略。false 时会关闭虚拟滚动',
        // },
        {
            label: '控件大小', field: 'size', type: 'radio-group', version: '',
            options: [
                {value: 'large', label: '大号'},
                {value: 'middle', label: '中号'},
                {value: 'small', label: '小号'},
            ],
            defaultValue: 'middle',
        },
        {label: '后缀图标', field: 'suffixIcon', type: 'ReactNode', version: '', desc: '自定义的选择框后缀图标'},
    ],
};
/*
[
    {label:'支持清除',field:'allowClear',type:'boolean',defaultValue:false,version:'',desc:'支持清除'},
    {label:'是否在选中项后清空搜索框，只在 mode 为 multiple 或 tags 时有效',field:'autoClearSearchValue',type:'boolean',defaultValue:true,version:'',desc:'是否在选中项后清空搜索框，只在 mode 为 multiple 或 tags 时有效'},
    {label:'默认获取焦点',field:'autoFocus',type:'boolean',defaultValue:false,version:'',desc:'默认获取焦点'},
    {label:'是否有边框',field:'bordered',type:'boolean',defaultValue:true,version:'',desc:'是否有边框'},
    {label:'自定义的多选框清空图标',field:'clearIcon',type:'ReactNode',version:'',desc:'自定义的多选框清空图标'},
    {label:'是否默认高亮第一个选项',field:'defaultActiveFirstOption',type:'boolean',defaultValue:true,version:'',desc:'是否默认高亮第一个选项'},
    {label:'是否默认展开下拉菜单',field:'defaultOpen',type:'boolean',version:'',desc:'是否默认展开下拉菜单'},
    {label:'指定默认选中的条目',field:'defaultValue',type:'radio-group',version:'',options:[{value:'string',label:'string'},{value:'string[]\\nnumber',label:'string[]\\nnumber'},{value:'number[]\\nLabeledValue',label:'number[]\\nLabeledValue'},{value:'LabeledValue[]',label:'LabeledValue[]'}],desc:'指定默认选中的条目'},
    {label:'是否禁用',field:'disabled',type:'boolean',defaultValue:false,version:'',desc:'是否禁用'},
    {label:'下拉菜单的 className 属性',field:'dropdownClassName',type:'string',version:'',desc:'下拉菜单的 className 属性'},
    {label:'下拉菜单和选择器同宽。默认将设置 min-width，当值小于选择框宽度时会被忽略。false 时会关闭虚拟滚动',field:'dropdownMatchSelectWidth',type:'radio-group',defaultValue:true,version:'',options:[{value:'boolean',label:'boolean'},{value:'number',label:'number'}],desc:'下拉菜单和选择器同宽。默认将设置 min-width，当值小于选择框宽度时会被忽略。false 时会关闭虚拟滚动'},
    {label:'自定义下拉框内容',field:'dropdownRender',type:'(originNode: ReactNode) => ReactNode',version:'',desc:'自定义下拉框内容'},
    {label:'下拉菜单的 style 属性',field:'dropdownStyle',type:'CSSProperties',version:'',desc:'下拉菜单的 style 属性'},
    {label:'是否根据输入项进行筛选。当其为一个函数时，会接收 inputValue option 两个参数，当 option 符合筛选条件时，应返回 true，反之则返回 false',field:'filterOption',type:'radio-group',defaultValue:true,version:'',options:[{value:'boolean',label:'boolean'},{value:'function(inputValue, option)',label:'function(inputValue, option)'}],desc:'是否根据输入项进行筛选。当其为一个函数时，会接收 inputValue option 两个参数，当 option 符合筛选条件时，应返回 true，反之则返回 false'},
    {label:'搜索时对筛选结果项的排序函数, 类似Array.sort里的 compareFunction',field:'filterSort',type:'(optionA: Option, optionB: Option) => number',version:'4.9.0',desc:'搜索时对筛选结果项的排序函数, 类似Array.sort里的 compareFunction'},
    {label:'菜单渲染父节点。默认渲染到 body 上，如果你遇到菜单滚动定位问题，试试修改为滚动的区域，并相对其定位。示例',field:'getPopupContainer',type:'function(triggerNode)',defaultValue:'() => document.body',version:'',desc:'菜单渲染父节点。默认渲染到 body 上，如果你遇到菜单滚动定位问题，试试修改为滚动的区域，并相对其定位。示例'},
    {label:'是否把每个选项的 label 包装到 value 中，会把 Select 的 value 类型从 string 变为 { value: string, label: ReactNode } 的格式',field:'labelInValue',type:'boolean',defaultValue:false,version:'',desc:'是否把每个选项的 label 包装到 value 中，会把 Select 的 value 类型从 string 变为 { value: string, label: ReactNode } 的格式'},
    {label:'设置弹窗滚动高度',field:'listHeight',type:'number',defaultValue:'256',version:'',desc:'设置弹窗滚动高度'},
    {label:'加载中状态',field:'loading',type:'boolean',defaultValue:false,version:'',desc:'加载中状态'},
    {label:'最多显示多少个 tag，响应式模式会对性能产生损耗',field:'maxTagCount',type:'radio-group',version:'responsive: 4.10',options:[{value:'number',label:'number'},{value:'responsive',label:'responsive'}],desc:'最多显示多少个 tag，响应式模式会对性能产生损耗'},
    {label:'隐藏 tag 时显示的内容',field:'maxTagPlaceholder',type:'radio-group',version:'',options:[{value:'ReactNode',label:'ReactNode'},{value:'function(omittedValues)',label:'function(omittedValues)'}],desc:'隐藏 tag 时显示的内容'},
    {label:'最大显示的 tag 文本长度',field:'maxTagTextLength',type:'number',version:'',desc:'最大显示的 tag 文本长度'},
    {label:'自定义多选时当前选中的条目图标',field:'menuItemSelectedIcon',type:'ReactNode',version:'',desc:'自定义多选时当前选中的条目图标'},
    {label:'设置 Select 的模式为多选或标签',field:'mode',type:'radio-group',version:'',options:[{value:'multiple',label:'multiple'},{value:'tags',label:'tags'}],desc:'设置 Select 的模式为多选或标签'},
    {label:'当下拉列表为空时显示的内容',field:'notFoundContent',type:'ReactNode',defaultValue:'Not Found',version:'',desc:'当下拉列表为空时显示的内容'},
    {label:'是否展开下拉菜单',field:'open',type:'boolean',version:'',desc:'是否展开下拉菜单'},
    {label:'搜索时过滤对应的 option 属性，如设置为 children 表示对内嵌内容进行搜索。若通过 options 属性配置选项内容，建议设置 optionFilterProp=\\'label\\' 来对内容进行搜索。',field:'optionFilterProp',type:'string',defaultValue:'value',version:'',desc:'搜索时过滤对应的 option 属性，如设置为 children 表示对内嵌内容进行搜索。若通过 options 属性配置选项内容，建议设置 optionFilterProp=\\'label\\' 来对内容进行搜索。'},
    {label:'回填到选择框的 Option 的属性值，默认是 Option 的子元素。比如在子元素需要高亮效果时，此值可以设为 value。示例',field:'optionLabelProp',type:'string',defaultValue:'children',version:'',desc:'回填到选择框的 Option 的属性值，默认是 Option 的子元素。比如在子元素需要高亮效果时，此值可以设为 value。示例'},
    {label:'数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能',field:'options',type:'{ label, value }[]',version:'',desc:'数据化配置选项内容，相比 jsx 定义会获得更好的渲染性能'},
    {label:'选择框默认文本',field:'placeholder',type:'string',version:'',desc:'选择框默认文本'},
    {label:'自定义的多选框清除图标',field:'removeIcon',type:'ReactNode',version:'',desc:'自定义的多选框清除图标'},
    {label:'控制搜索文本',field:'searchValue',type:'string',version:'',desc:'控制搜索文本'},
    {label:'是否显示下拉小箭头',field:'showArrow',type:'boolean',defaultValue:'单选为 true，多选为 false',version:'',desc:'是否显示下拉小箭头'},
    {label:'使单选模式可搜索',field:'showSearch',type:'boolean',defaultValue:false,version:'',desc:'使单选模式可搜索'},
    {label:'选择框大小',field:'size',type:'radio-group',defaultValue:'middle',version:'',options:[{value:'large',label:'large'},{value:'middle',label:'middle'},{value:'small',label:'small'}],desc:'选择框大小'},
    {label:'自定义的选择框后缀图标',field:'suffixIcon',type:'ReactNode',version:'',desc:'自定义的选择框后缀图标'},
    {label:'自定义 tag 内容 render',field:'tagRender',type:'(props) => ReactNode',version:'',desc:'自定义 tag 内容 render'},
    {label:'在 tags 和 multiple 模式下自动分词的分隔符',field:'tokenSeparators',type:'string[]',version:'',desc:'在 tags 和 multiple 模式下自动分词的分隔符'},
    {label:'指定当前选中的条目',field:'value',type:'radio-group',version:'',options:[{value:'string',label:'string'},{value:'string[]\\nnumber',label:'string[]\\nnumber'},{value:'number[]\\nLabeledValue',label:'number[]\\nLabeledValue'},{value:'LabeledValue[]',label:'LabeledValue[]'}],desc:'指定当前选中的条目'},
    {label:'设置 false 时关闭虚拟滚动',field:'virtual',type:'boolean',defaultValue:true,version:'4.1.0',desc:'设置 false 时关闭虚拟滚动'},
    {label:'失去焦点时回调',field:'onBlur',type:'function',version:'',desc:'失去焦点时回调'},
    {label:'选中 option，或 input 的 value 变化时，调用此函数',field:'onChange',type:'radio-group',version:'',options:[{value:'function(value, option:Option',label:'function(value, option:Option'},{value:'Array<Option>)',label:'Array<Option>)'}],desc:'选中 option，或 input 的 value 变化时，调用此函数'},
    {label:'清除内容时回调',field:'onClear',type:'function',version:'4.6.0',desc:'清除内容时回调'},
    {label:'取消选中时调用，参数为选中项的 value (或 key) 值，仅在 multiple 或 tags 模式下生效',field:'onDeselect',type:'radio-group',version:'',options:[{value:'function(string',label:'function(string'},{value:'number',label:'number'},{value:'LabeledValue)',label:'LabeledValue)'}],desc:'取消选中时调用，参数为选中项的 value (或 key) 值，仅在 multiple 或 tags 模式下生效'},
    {label:'展开下拉菜单的回调',field:'onDropdownVisibleChange',type:'function(open)',version:'',desc:'展开下拉菜单的回调'},
    {label:'获得焦点时回调',field:'onFocus',type:'function',version:'',desc:'获得焦点时回调'},
    {label:'按键按下时回调',field:'onInputKeyDown',type:'function',version:'',desc:'按键按下时回调'},
    {label:'鼠标移入时回调',field:'onMouseEnter',type:'function',version:'',desc:'鼠标移入时回调'},
    {label:'鼠标移出时回调',field:'onMouseLeave',type:'function',version:'',desc:'鼠标移出时回调'},
    {label:'下拉列表滚动时的回调',field:'onPopupScroll',type:'function',version:'',desc:'下拉列表滚动时的回调'},
    {label:'文本框值变化时回调',field:'onSearch',type:'function(value: string)',version:'',desc:'文本框值变化时回调'},
    {label:'被选中时调用，参数为选中项的 value (或 key) 值',field:'onSelect',type:'radio-group',version:'',options:[{value:'function(string',label:'function(string'},{value:'number',label:'number'},{value:'LabeledValue, option: Option)',label:'LabeledValue, option: Option)'}],desc:'被选中时调用，参数为选中项的 value (或 key) 值'}
]
* */
