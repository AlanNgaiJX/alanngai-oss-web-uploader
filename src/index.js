import CryptoJS from "./crypto-js";

class Uploader {
  constructor(signatureApi) {
    this.concurrencyCount = 1; //并发数
    this.waitingQueue = []; // 待上传队列
    this.uploadingQueue = []; // 上传中队列
    this.errorQueue = []; // 上传失败队列
    this.uploadedQueue = []; // 上传成功队列
    this.choosing = false; // 是否正在选择图片
    this.uploading = false; // 是否正在上传
    this.isCheckingQueue = false;
    this.taskId = 0;
    this.loadedBuffer = 0;
    this.bufferSpeed = 0;
    this.checkQueueList = null;

    this.debug = false;

    /* 签名接口与数据 */
    this.signatureApi = signatureApi; // ()=> promise , resolve(signatureInfo)
    this.signatureInfo = null;
    // ex.
    // {
    //   "expire": "1666689212",
    //   "policy": "xxx",
    //   "signature": "xxx",
    //   "accessid": "xxx",
    //   "host": "http://xxx.oss-cn-shenzhen.aliyuncs.com",
    //   "callback": "eyJjYWxsYmFja1VybCI6Imh0dHBzOi8vNTE3NTBtNW8yNy56aWNwLmZ1bi9vc3NfdXBsb2FkX2NhbGxiYWNrIiwiY2FsbGJhY2tCb2R5IjoiZmlsZW5hbWU9JHtvYmplY3R9JnNpemU9JHtzaXplfSZtaW1lVHlwZT0ke21pbWVUeXBlfSZoZWlnaHQ9JHtpbWFnZUluZm8uaGVpZ2h0fSZ3aWR0aD0ke2ltYWdlSW5mby53aWR0aH0iLCJjYWxsYmFja0JvZHlUeXBlIjoiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkIn0=",
    //   "dir": "upload/"
    // }

    /* 回调 */
    this.onComputedId = null; // 单个文件初始化成功事件
    this.onSuccess = null; // 单个文件成功事件
    this.onError = null; // 单个文件失败事件
    this.onAllFinish = null; // 全部上传已执行事件（忽略失败任务）
    this.onAllSuccess = null; // 全部上传成功事件
    this.onProgress = null; // 进度事件
    this.eventType = null; // 上传的oss目录
  }

  uploadFiles(
    {
      files,
      onComputedId,
      onComputedMd5,
      onProgress,
      onSuccess,
      onAllSuccess,
      onError,
    },
    eventType
  ) {
    const _this = this;
    _this.uploading = true; // 正在上传
    _this.loadedBuffer = 0;
    _this.bufferSpeed = 0;
    _this.onComputedId = onComputedId;
    _this.onComputedMd5 = onComputedMd5;
    _this.onSuccess = onSuccess;
    _this.onError = onError;
    _this.onAllSuccess = onAllSuccess;
    _this.onProgress = onProgress;
    _this.eventType = eventType;

    let i = 0;

    // 检查上传队列，开始上传
    _this.checkQueueList = function () {
      if (
        _this.waitingQueue.length !== 0 &&
        _this.uploadingQueue.length < _this.concurrencyCount
      ) {
        _this.isCheckingQueue = true;
        const uploadTask = _this.waitingQueue.shift();
        _this.uploadingQueue.push(uploadTask);
        getSignature()
          .then(() => uploadToOss(uploadTask))
          .catch(() => {
            // 从上传中队列移出
            Uploader.removeOutOf(_this.uploadingQueue, uploadTask);
            onUploadError(uploadTask);
            // 检测上传队列
            _this.checkQueueList();
          });
      } else if (
        _this.waitingQueue.length === 0 &&
        _this.uploadingQueue.length === 0
      ) {
        _this.isCheckingQueue = false;
        _this.uploading = false;
        _this.bufferSpeed = 0;
        _this.loadedBuffer = 0;
        // 全部完成，（此时忽略上传失败，默认为全部已完成）
        onUploadAllFinish();

        if (_this.errorQueue.length === 0) {
          // 此时没有失败任务则全部成功
          onUploadAllSuccess();
        }
      }
    };

    judge();

    // 枢纽1
    function judge() {
      if (i < files.length) {
        initQueue();
      } else {
        // 检查上传列表
        _this.checkQueueList();
      }
    }

    // 装配上传队列
    function initQueue() {
      const file = files[i];
      /* 任务初始化 */
      const uploadTask = {
        id: _this.taskId,
        url: window.URL.createObjectURL(file),
        suffix: Uploader.getFileSuffix(file.name),
        status: "wait",
        file,
      };
      _this.waitingQueue.push(uploadTask);
      onUploadComputedId(uploadTask);
      _this.taskId++;

      /* 计算md5 */
      const chunkedBlob = Uploader.chunckFileToBlob(file);
      const fr = new FileReader();
      fr.onload = () => {
        uploadTask.md5 = Uploader.getFileMd5(fr.result, file);
        onUploadComputedMd5(uploadTask);
      };
      fr.readAsDataURL(chunkedBlob);

      i++;
      judge();
    }

    //上传前获取签名 update标记说明需要更新
    function getSignature(forceUpdate) {
      return new Promise((resolve, reject) => {
        if (!_this.signatureInfo || forceUpdate) {
          _this
            .signatureApi()
            .then((info) => {
              _this.signatureInfo = info;
              resolve();
            })
            .catch(() => {
              reject();
            });
        } else {
          resolve();
        }
      });
    }

    // 上传到oss
    function uploadToOss(uploadTask) {
      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        !_this.debug
          ? _this.signatureInfo.host
          : _this.signatureInfo.host + "123",
        true
      );
      xhr.onload = (e) => {
        if (e.target.readyState == 4 && e.target.status == 200) {
          const response = JSON.parse(e.target.responseText);
          const data = response.data;
          // ex.
          // {
          //   "Status": "Ok",
          //   "baseUrl": "https://alanngai1996.xyz/",
          //   "filename": "upload/c4f0c78a26.JPG",
          //   "size": "195980",
          //   "mimeType": "image/jpeg",
          //   "height": "560",
          //   "width": "3000",
          //   "url": "https://alanngai1996.xyz/upload/c4f0c78a26.JPG"
          // }
          if (data.Status === "Ok") {
            // 上传成功
            // 从上传中队列移出
            Uploader.removeOutOf(_this.uploadingQueue, uploadTask);
            // 加入上传成功队列
            uploadTask.uploadedUrl = data.url;
            _this.uploadedQueue.push(uploadTask);
            onUploadSuccess(uploadTask);
            // 继续队列
            _this.checkQueueList();
          } else {
            // 上传失败
            cbFail();
          }
        } else {
          // 上传失败
          cbFail();
        }
      };
      //上传过程中执行
      xhr.upload.onprogress = function (e) {
        const progress = e.loaded / e.total;

        _this.bufferSpeed += e.loaded - _this.loadedBuffer;
        _this.loadedBuffer = e.loaded;
        //变更进度
        onUploadProgress(uploadTask, "loading", progress);
      };
      xhr.onerror = () => {
        cbFail();
      };

      function cbFail() {
        // 从上传中队列移出
        Uploader.removeOutOf(_this.uploadingQueue, uploadTask);
        onUploadError(uploadTask);
        // 检测上传队列
        _this.checkQueueList();
      }

      const formData = new FormData();
      formData.append("name", `${uploadTask.md5}.${uploadTask.suffix}`);
      formData.append(
        "key",
        `${_this.signatureInfo.dir}${uploadTask.md5}.${uploadTask.suffix}`
      );
      formData.append("policy", _this.signatureInfo.policy);
      formData.append("OSSAccessKeyId", _this.signatureInfo.accessid);
      formData.append("success_action_status", "200");
      formData.append("signature", _this.signatureInfo.signature);
      formData.append("callback", _this.signatureInfo.callback);
      formData.append("file", uploadTask.file);

      xhr.send(formData);

      uploadTask.xhr = xhr;
    }

    // 初始化回调处理器
    function onUploadComputedId(uploadTask) {
      onUploadProgress(uploadTask, "inited");
      if (typeof _this.onComputedId == "function") {
        _this.onComputedId(Object.assign({}, uploadTask));
      }
    }

    // md5回调处理器
    function onUploadComputedMd5(uploadTask) {
      onUploadProgress(uploadTask, "md5");
      if (typeof _this.onComputedMd5 == "function") {
        _this.onComputedMd5(Object.assign({}, uploadTask));
      }
    }

    // 进度回调处理器
    function onUploadProgress(uploadTask, status, progress = null) {
      uploadTask.status = status;
      uploadTask.progress = progress;
      if (typeof _this.onProgress == "function") {
        _this.onProgress(Object.assign({}, uploadTask));
      }
    }

    // 成功回调处理器
    function onUploadSuccess(uploadTask) {
      onUploadProgress(uploadTask, "success");

      if (typeof _this.onSuccess == "function") {
        // 还剩余多少个未上传
        const existCount =
          _this.waitingQueue.length +
          _this.uploadingQueue.length +
          _this.errorQueue.length;

        _this.onSuccess(Object.assign({}, uploadTask), existCount);
      }
    }

    // 全部完成回调处理器
    function onUploadAllFinish() {
      if (typeof _this.onAllFinish == "function") {
        _this.onAllFinish();
      }
    }

    // 全部上传成功回调处理器
    function onUploadAllSuccess() {
      if (typeof _this.onAllSuccess == "function") {
        _this.onAllSuccess();
      }
    }

    // 失败回调处理器
    function onUploadError(uploadTask) {
      onUploadProgress(uploadTask, "fail");
      _this.errorQueue.push(uploadTask);

      if (typeof _this.onError == "function") {
        _this.onError(Object.assign({}, uploadTask));
      }
    }
  }

  // 打开或关闭调试, 该调试开关能使上传任务失败
  toggleDebug() {
    this.debug = !this.debug;
  }

  // 重试所有失败任务
  retryErrorQueue() {
    while (this.errorQueue.length) {
      const uploadTask = this.errorQueue.shift();
      const { id, url, suffix, file, md5 } = uploadTask;
      const _uploadTask = {
        id,
        url,
        suffix,
        file,
        md5,
        status: "md5",
      };

      this.waitingQueue.push(_uploadTask);
    }
    if (!this.isCheckingQueue) {
      this.checkQueueList && this.checkQueueList();
    }
  }

  // 重试单个失败任务
  retryErrorTaskById(taskId) {
    const uploadTaskIndex = this.errorQueue.findIndex(
      (item) => item.id === Number(taskId)
    );
    if (uploadTaskIndex > -1) {
      const uploadTask = this.errorQueue.splice(uploadTaskIndex, 1)[0];
      const { id, url, suffix, file, md5 } = uploadTask;
      const _uploadTask = {
        id,
        url,
        suffix,
        file,
        md5,
        status: "md5",
      };

      this.waitingQueue.push(_uploadTask);

      if (!this.isCheckingQueue) {
        this.checkQueueList && this.checkQueueList();
      }
    }
  }

  // 从任何队列移除某一任务
  delTaskById(taskId) {
    const task = { id: Number(taskId) };
    Uploader.removeOutOf(this.waitingQueue, task);
    Uploader.removeOutOf(this.uploadingQueue, task);
    Uploader.removeOutOf(this.uploadedQueue, task);
    Uploader.removeOutOf(this.errorQueue, task);
  }

  // 从某个队列移出某项(id)
  static removeOutOf(list, uploadTask) {
    for (let i = 0; i < list.length; i++) {
      const id = list[i].id;
      if (id == uploadTask.id) {
        list.splice(i, 1);
      }
    }
  }

  // 计算md5
  static getFileMd5(frResult, file, salt = "") {
    var md5 = CryptoJS.MD5(frResult + file.lastModified + salt).toString();
    return [
      md5.substring(0, 8),
      md5.substring(8, 12),
      md5.substring(12, 16),
      md5.substring(16, 20),
      md5.substring(20, 32),
    ].join("-");
  }

  // 大文件分片再转blob (适配200m以上的文件计算md5会失败)
  static chunckFileToBlob(file) {
    file.slice = file.slice || file.webkitSlice;

    const filePart1 = file.slice(0, 100);
    const filePart2 = file.slice(file.size / 2 - 50, file.size / 2 + 50);
    const filePart3 = file.slice(file.size - 100, file.size);

    return new Blob([filePart1, filePart2, filePart3]);
  }

  // 获取文件后缀
  static getFileSuffix(filename) {
    const pos = filename.lastIndexOf(".");
    let suffix = "";
    if (pos != -1) {
      suffix = filename.substring(pos + 1);
    }
    return suffix;
  }

  // 展示上传速度
  static parseBufferSpeed(bufferSpeed) {
    if (bufferSpeed > 1024 * 1024) {
      bufferSpeed = (bufferSpeed / (1024 * 1024)).toFixed(1) + "MB/s";
    } else {
      bufferSpeed = Math.round(bufferSpeed / 1024) + "KB/s";
    }
    return bufferSpeed;
  }
}

export default Uploader;
