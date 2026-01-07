/**
 * validStore
 * -------------------------
 * ข้อมูลร้านค้าที่ครบถ้วนและถูกต้องทุก field
 * ใช้สำหรับ Test case แบบ Positive
 * - ควรถูก submit ได้สำเร็จ
 * - ใช้ทดสอบ flow ปกติของการสร้าง/แก้ไขร้าน
 * - ครอบคลุมข้อมูลที่อยู่, พิกัดแผนที่, รูปภาพ และ tag ครบ
 */
export const validStore = {
  name: "ป้านกน้อย",
  description: "ป้านกน้อยขายส้มตำแซ่บ ๆ มาอีกได้จ๊ะลูก ๆ",
  houseNo: "11",
  villageNo: "6",
  province: "ชลบุรี",
  district: "เมือง",
  subdistrict: "แสนสุข",
  addressDetail: "บ้านเลขที่ 11 หมู่ 6",
  locationSearch: "บางแสน",
  tags: ["Relax", "Food", "Nature"],
  lat: "13.736717",
  lng: "100.523186",
  coverImage: "assets/storePhoto/cover.jpeg",
  galleryImage: [
    "assets/storePhoto/images1.jpg",
    "assets/storePhoto/images2.jpeg",
    "assets/storePhoto/images3.JPEG",
    "assets/storePhoto/images4.jpg",
    "assets/storePhoto/images5.jpg",
  ],
};

/**
 * incompleteStore
 * -------------------------
 * ข้อมูลร้านค้าที่ไม่ครบถ้วน
 * ใช้สำหรับ Test case แบบ Negative
 * - ใช้ทดสอบ validation / error handling
 * - คาดหวังให้ระบบไม่อนุญาตให้ submit
 * - ขาดข้อมูลสำคัญ เช่น description, ที่อยู่บางส่วน,
 *   พิกัดแผนที่, รูปภาพ และ tag
 */
export const incompleteStore = {
  name: "ป้านกน้อย",
  houseNo: "11",
  villageNo: "6",
  province: "ชลบุรี",
  addressDetail: "บ้านเลขที่ 11 หมู่ 6",
  locationSearch: "บางแสน",
};
