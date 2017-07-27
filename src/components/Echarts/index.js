import React, { Component } from 'react';
import { WebView, View, StyleSheet } from 'react-native';
import renderChart from './renderChart';
import echarts from './echarts.min';

import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';

const BODY_TAG_PATTERN = /\<\/ *body\>/;

var script = `
;(function() {
var wrapper = document.createElement("div");
wrapper.id = "height-wrapper";
while (document.body.firstChild) {
    wrapper.appendChild(document.body.firstChild);
}
document.body.appendChild(wrapper);
var i = 0;
function updateHeight() {
    document.title = wrapper.clientHeight;
    window.location.hash = ++i;
}
updateHeight();
window.addEventListener("load", function() {
    updateHeight();
    setTimeout(updateHeight, 1000);
});
window.addEventListener("resize", updateHeight);
}());
`;


const style = `
<style>
body, html, #height-wrapper {
    margin: 0;
    padding: 0;
}
#height-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
}
</style>
<script>
${script}
</script>
`;

const codeInject = (html) => html.replace(BODY_TAG_PATTERN, style + "</body>");

var source;
const _source = resolveAssetSource(require('./tpl.html'));
if (__DEV__) {
  source = { uri: `${_source.uri}` };
} else {
  const sourceAndroid = { uri: codeInject('file:///android_asset/tpl.html')};
  const sourceIOS = { uri: codeInject(`file://${_source.uri}`)};
  source = Platform.OS === 'ios' ? sourceIOS : sourceAndroid;
}

export default class App extends Component {

  componentWillReceiveProps(nextProps) {
    if(nextProps.option !== this.props.option) {
      this.refs.chart.reload();
    }
  }

  render() {
    return (
      <View style={{flex: 1, height: this.props.height || 400,}}>
        <WebView
          ref="chart"
          scrollEnabled = {false}
          injectedJavaScript = {renderChart(this.props)}
          style={{
            height: this.props.height || 400,
          }}
          source={source}
        />
      </View>
    );
  }
}
