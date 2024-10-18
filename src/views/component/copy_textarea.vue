<template>
    <div class="copytextarea">
        <el-input :readonly="readonly"  v-model="internalValue" type="textarea" :rows="rows" :placeholder="placeholder"  />
        <el-button  size="small"  type="success" @click="copyText" :icon="DocumentCopy"/>
        <el-alert v-if="copied" type="success" :title="$t('copySuccess')" show-icon />
    </div>
</template>

<script setup>
import { ref, toRefs,watch} from 'vue';
import { ElMessage } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'; // Add this import
const {t} = useI18n();
const props = defineProps({
    modelValue: {
        type: String,
        required: true,
    },
    rows: {
        type: Number,
        default: 5,
    },
    placeholder: {
        type: String,
        default: 'Type or paste your text here...',
    },
    readonly: {
        type: Boolean,
        default: false,
    },

});


// Define emit
const emit = defineEmits(['update:modelValue']);

// Create a local reference to track the internal value
const internalValue = ref(props.modelValue);

// Watch for changes in the `modelValue` and update `internalValue`
watch(
  () => props.modelValue,
  (newVal) => {
    internalValue.value = newVal;
  }
);

// Emit the new value whenever the user updates the input
watch(internalValue, (newVal) => {
  emit('update:modelValue', newVal);
});

 
const copied = ref(false);

const copyText = async () => {
    if(!internalValue.value){
        return
    }
    const clipBoard = navigator.clipboard;
    if (!clipBoard) {
        // use old commandExec() way
        //console.log("old")
        const el = document.createElement('textarea');
        el.value = internalValue.value;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        ElMessage.success(t('textCopySuccess'));
        copied.value = true;

    } else {
        //console.log("new")
        clipBoard.writeText(internalValue.value).then(() => {
            ElMessage.success(t('textCopySuccess'));
        });
        copied.value = true;
    }
    setTimeout(() => {
        copied.value = false;
    }, 2000);


    // //console.log(modelValue.value)
    // try {
    //   await navigator.clipboard.writeText(modelValue.value);
    //   copied.value = true;
    //   ElMessage.success('Text copied successfully!');
    //   setTimeout(() => {
    //     copied.value = false;
    //   }, 2000);
    // } catch (err) {
    //     //console.log(err)
    //   ElMessage.error('Failed to copy text.');
    // }
};
</script>

<style scoped>

.el-button {
    margin-top: 10px;
}

.copytextarea {
    width: 100%;
}
</style>