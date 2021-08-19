# 组件配置

## API

字段 | 必须 | 默认 | 说明
---|---|---|---
title | 是 | - | 分类标题、组件标题
children | 是 | - | 组件分类
subTitle | 是 | - | 分类副标题
hidden | 否 | `false` | 不显示
icon | 否 | 组件配置中icon属性 | 显示icon，false不显示
renderPreview | 否 | `true` | 是否渲染预览，可以为 直接jsx `<div>直接jsx</div>`，可以为函数 `config => true`
previewProps | 否 | `{}` | 预览时额外属性
previewZoom | 否 | - | 预览缩放
previewWrapperStyle | 否 | - | 预览容器样式
previewHeight | 否 | 200 或 44 | 预览容器高度
image | 否 | - | 预览图片
