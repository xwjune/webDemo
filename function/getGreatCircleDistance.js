/**
 * 根据经纬度计算两地距离
 */
const EARTH_RADIUS = 6378137.0; // 单位M
const PI = Math.PI;

function getRad(d){
  return d * PI / 180.0;
}

/**
 * caculate the great circle distance
 * @param {Object} lat1
 * @param {Object} lng1
 * @param {Object} lat2
 * @param {Object} lng2
 */
function getGreatCircleDistance(lat1, lng1, lat2, lng2) {
  const radLat1 = getRad(lat1);
  const radLat2 = getRad(lat2);
  
  const a = radLat1 - radLat2;
  const b = getRad(lng1) - getRad(lng2);
  
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
  s = s * EARTH_RADIUS;
  // s = Math.round(s * 10000) / 10000;
  s = Math.round(s);
          
  return s;
}
