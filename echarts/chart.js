// tooltip加单位
export function tooltipFormatter(params, unit) {
  let result = params[0].name;
  params.forEach((item) => {
    result += `<div style="margin-top: 5px; display: flex; justify-content: space-between;"><span>${item.marker}${item.seriesName}</span><span style="font-weight: bold; padding-left: 10px">${item.value}${unit}</span></div>`;
  });
  return result;
}
