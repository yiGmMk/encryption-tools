<template>
    <div class="container">
        <el-header>
            <div class="title">{{ $t('fileEncryption.title') }}</div>
        </el-header>
        <el-main>
            <el-form :model="form" :rules="rules" ref="formRef" label-position="top">
                <el-form-item :label="$t('fileEncryption.uploadFile')">
                    <el-upload class="upload" drag action="" :on-change="handleFileChange" :file-list="fileList"
                        :show-file-list="false" :auto-upload="false">
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                            <em>{{ $t('fileEncryption.dragOrClick') }}</em>
                        </div>
                    </el-upload>
                </el-form-item>
                <el-form-item>
                    <p v-if="fileName">{{ $t('fileEncryption.selectedFile') }}：{{ fileName }}</p>
                </el-form-item>

                <el-form-item :label="$t('fileEncryption.encryptionKey')" prop="key">
                    <el-input v-model="form.key" :placeholder="$t('fileEncryption.enterKey')" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" class="encode-btn" @click="submitForm('encrypt')" :disabled="!file || isProcessing"
                        :loading="isProcessing" icon="Lock">
                        {{ $t('fileEncryption.encryptFile') }}
                    </el-button>
                    <el-button type="success" class="decode-btn" @click="submitForm('decrypt')" :disabled="!file || isProcessing"
                        :loading="isProcessing" icon="Unlock">
                        {{ $t('fileEncryption.decryptFile') }}
                    </el-button>
                </el-form-item>

                <el-form-item v-if="encryptedData">
                
                    <el-link type="primary" :href="downloadEncryptedLink" :download="encryptedFileName">
                        {{ $t('fileEncryption.downloadEncryptedFile') }} {{ encryptedFileName }}
                    </el-link>
                </el-form-item>

                <el-form-item v-if="decryptedBlob">
                    <el-link type="success" :href="downloadDecryptedLink" :download="decryptedFileName">
                        {{ $t('fileEncryption.downloadDecryptedFile') }}  {{ decryptedFileName }}
                    </el-link>

                </el-form-item>
            </el-form>
        </el-main>
    </div>
</template>
<script setup>
import { ref } from 'vue';
import CryptoJS from 'crypto-js';
import { ElMessage } from 'element-plus';

const form = ref({
    key: ''
});
const file = ref(null);
const fileName = ref('');
const fileList = ref([]);
const encryptedData = ref(false);
const decryptedBlob = ref(false);
const downloadLink = ref('');
const downloadEncryptedLink = ref('')
const downloadDecryptedLink = ref('')
const encryptedFileName = ref('');
const decryptedFileName = ref('');
const isProcessing = ref(false); // 控制加载状态
const formRef = ref(null);
const CHUNK_SIZE = 1024 * 1024; // 每块大小为 1MB

const rules = {
    key: [
        { required: true, message: 'Key is required', trigger: 'blur' }
    ]
};
// 处理文件选择
const handleFileChange = (fileChange) => {
    const files = fileChange.raw;
    file.value = files;
    fileName.value = files.name;
};

// 获取文件名和扩展名的工具函数
const getFileBaseName = (name) => name.substring(0, name.lastIndexOf('.'));
const getFileExtension = (name) => name.substring(name.lastIndexOf('.'));

// 生成随机初始化向量（IV）
const generateIV = () => {
    return CryptoJS.lib.WordArray.random(16); // CBC模式下IV需要为16字节
};

// 将密钥转换为256位长度
const formatKey = (keyValue) => {
    return CryptoJS.SHA256(keyValue); // 使用SHA256生成32字节密钥
};


// 提交表单
const submitForm = (action) => {
    formRef.value.validate((valid) => {
        if (valid) {
            if (action === 'encrypt') {
                encryptFile();
            } else if (action === 'decrypt') {
                decryptFile();
            }
        } else {
            ElMessage.error('Please fill in the required fields');
            return false;
        }
    });
};

// 分块加密文件
const encryptFile = () => {
    if (!form.value.key) {
        ElMessage.error('Please input your key for encryption');
        return;
    }

    encryptedData.value = false;//显示下载文件
    isProcessing.value = true; // 设置按钮为加载状态

    const iv = generateIV(); // 生成IV
    const formattedKey = formatKey(form.value.key); // 确保密钥为256位

    const reader = new FileReader();
    const fileSize = file.value.size;
    let offset = 0;
    let encryptedChunks = [];

    // 读取文件块
    const readNextChunk = () => {
        const chunk = file.value.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(chunk);
    };

    reader.onload = function (event) {
        const fileData = event.target.result;
        const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(fileData));

        // 加密当前块，使用 AES-256-CBC
        const encryptedChunk = CryptoJS.AES.encrypt(wordArray, formattedKey, { iv }).toString();
        encryptedChunks.push(encryptedChunk);

        offset += CHUNK_SIZE;
        if (offset < fileSize) {
            // 继续读取下一块
            readNextChunk();
        } else {
            // 文件读取完毕，生成加密后的 Blob
            const ivHex = iv.toString(CryptoJS.enc.Hex); // 将IV以Hex格式附加到加密文件开头
            const encryptedBlob = new Blob([ivHex, ...encryptedChunks], { type: 'application/octet-stream' });

            const baseName = getFileBaseName(fileName.value);
            const extension = getFileExtension(fileName.value);
            encryptedFileName.value = `${baseName}.enc${extension}`;
            downloadEncryptedLink.value = URL.createObjectURL(encryptedBlob);
            ElMessage.success('文件加密成功');
            isProcessing.value = false; // 结束加载状态
            encryptedData.value = true;//显示下载文件
        }
    };

    reader.onerror = function () {
        ElMessage.error('文件加密过程中出错');
        isProcessing.value = false; // 结束加载状态
    };

    readNextChunk(); // 开始读取第一块
};

// 分块解密文件
const decryptFile = () => {
    if (!form.value.key) {
        ElMessage.error('Please input your key for decryption');
        return;
    }

    isProcessing.value = true; // 设置按钮为加载状态

    const reader = new FileReader();
    let fileSize = file.value.size - 32;
    let offset = 0;
    let decryptedChunks = [];

    // 读取文件块
    const readNextChunk = () => {
        const chunk = file.value.slice(offset, offset + CHUNK_SIZE);
        reader.readAsText(chunk);
    };

    let iv
    let actualEncryptedChunk
    reader.onload = function (event) {
        const encryptedChunk = event.target.result;
        if (offset === 0) {
            // 第一块内容应该包含IV
            const ivHex = encryptedChunk.slice(0, 32); // 32个字符的IV
            iv = CryptoJS.enc.Hex.parse(ivHex); // 从Hex字符串转换为WordArray
            actualEncryptedChunk = encryptedChunk.slice(32); // 去掉IV部分
        }
        offset += CHUNK_SIZE;
        try {
            const formattedKey = formatKey(form.value.key);
            const decryptedChunk = CryptoJS.AES.decrypt(actualEncryptedChunk, formattedKey, { iv });

            const uint8Array = new Uint8Array(decryptedChunk.sigBytes);
            for (let i = 0; i < decryptedChunk.sigBytes; i++) {
                uint8Array[i] = decryptedChunk.words[i >>> 2] >>> (24 - (i % 4) * 8) & 0xff;
            }

            decryptedChunks.push(uint8Array);

            if (offset < fileSize) {
                // 继续读取下一块
                console.log(fileSize)
                readNextChunk();
            } else {
                // 文件读取完毕，生成解密后的 Blob
                console.log("文件读取完毕，生成解密后的 Blob")
                const decryptedBlobObject = new Blob(decryptedChunks, { type: file.value.type });
                const baseName = getFileBaseName(fileName.value.replace('.enc', ''));
                const extension = getFileExtension(fileName.value);
                decryptedFileName.value = `${baseName}.dec${extension}`;
                downloadDecryptedLink.value = URL.createObjectURL(decryptedBlobObject);
                ElMessage.success('文件解密成功');
                isProcessing.value = false; // 结束加载状态
                decryptedBlob.value = true;//显示下载文件
            }
        } catch (error) {
            ElMessage.error('解密失败，请检查密钥或文件内容');
            isProcessing.value = false; // 结束加载状态
        }

    };

    reader.onerror = function () {
        ElMessage.error('文件解密过程中出错');
        isProcessing.value = false; // 结束加载状态
    };

    readNextChunk(); // 开始读取第一块
};
</script>


<style scoped>
.upload {
    width: 100%;
}

.encode-btn {
  width: 120px;
  background-color: #007aff;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.encode-btn:hover {
  background-color: #005bb5;
}

/* Success decode button */
.decode-btn {
  width: 120px;
  background-color: #34c759;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 16px;
  transition: background-color 0.3s ease;
}


.decode-btn:hover {
  background-color: #28a745;
}



.el-form-item {
    margin-bottom: 20px;
}
</style>