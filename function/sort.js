// 选择排序
function selectSort(arr, desc = false) {
    const len = arr.length;
    if (desc) { // 降序
      let max = 0;
      for (let i = 0; i < len - 1; i++) {
        max = i;
        for (let j = i + 1; j < len; j++) {
          if (arr[j] > arr[max]) {
            max = j;
          }
        }
        if (max !== i && arr[max] !== arr[i]) {
          arr[max] ^= arr[i];
          arr[i] ^= arr[max];
          arr[max] ^= arr[i];
        }
      }
    } else {
      let min = 0;
      for (let i = 0; i < len - 1; i++) {
        min = i;
        for (let j = i + 1; j < len; j++) {
          if (arr[j] < arr[min]) {
            min = j;
          }
        }
        if (min !== i && arr[min] !== arr[i]) {
          arr[min] ^= arr[i];
          arr[i] ^= arr[min];
          arr[min] ^= arr[i];
        }
      }
    }
  }
  
  // 冒泡排序
  function bubbleSort(arr, desc = false) {
    const len = arr.length;
    let finish = false;
    if (desc) {
      for (let i = 0; i < len - 1; i++) {
        finish = true;
        for (let j = 0; j < len - i - 1; j++) {
          if (arr[j + 1] > arr[j]) {
            arr[j + 1] ^= arr[j];
            arr[j] ^= arr[j + 1];
            arr[j + 1] ^= arr[j];
            finish = false;
          }
        }
        if (finish) {
          break;
        }
      }
    } else {
      for (let i = 0; i < len - 1; i++) {
        finish = true;
        for (let j = 0; j < len - i - 1; j++) {
          if (arr[j + 1] < arr[j]) {
            arr[j + 1] ^= arr[j];
            arr[j] ^= arr[j + 1];
            arr[j + 1] ^= arr[j];
            finish = false;
          }
        }
        if (finish) {
          break;
        }
      }
    }
  }
  
  // 插入排序
  function insertSort(arr, desc = false) {
    const len = arr.length;
    let temp = null;
    let j = null;
    if (desc) {
      for (let i = 1; i < len; i++) {
        j = i;
        temp = arr[i];
        while (j > 0 && temp > arr[j - 1]) {
          arr[j] = arr[j - 1];
          j--;
        }
        arr[j] = temp;
      }
    } else {
      for (let i = 1; i < len; i++) {
        j = i;
        temp = arr[i];
        while (j > 0 && temp < arr[j - 1]) {
          arr[j] = arr[j - 1];
          j--;
        }
        arr[j] = temp;
      }
    }
  }
  