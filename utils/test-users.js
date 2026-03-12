/**
 * ข้อมูลผู้ใช้งานสำหรับการทดสอบ (Test Users)
 * ใช้กำหนด credential และเส้นทางการ redirect ตาม role
 * เพื่อนำไปใช้ใน test case และ helper function ของ loginAs()
 */
export const users = {
    superadmin: {
        email: "superadmin_1@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        redirectTo: "/super/communities",
    },
    admin: {
        email: "comm_admin_2@example.com",
        password: "Hashedpw1",
        loginPath: "/guest/partner/login",
        redirectTo: "/admin/community/own",
    },
    admin4: {
        email: "comm_admin_4",
    },
    thanakorn: {
        email: "comm_admin_1",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        redirectTo: "/admin/community/own",
    },
    member1: {
        email: "member_1",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        redirectTo: "/member/home",
    },
    tourist: {
        email: "tourist_1",
        password: "hashedpw",
        loginPath: "/guest/login",
        redirectTo: "/tourist/home",
    },
    member: {
        email: "comm_member_1@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        //redirectTo: "/member/community/own",
    },
    member2: {
        email: "comm_member_2@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        //redirectTo: "/member/community/own",
    },
    memberForReplyMessagesTest: {
        email: "member_1@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        //redirectTo: "/member/community/own",
    },
    SuperAdmin: {
        email: "superadmin@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        redirectTo: "/super/communities",
    },
    Admin1: {
        email: "admin1@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        redirectTo: "/admin/community/own",
    },
    Tourist1: {
        email: "tourist1@example.com",
        password: "hashedpw",
        loginPath: "/guest/login",
        redirectTo: "/tourist/home",
    },
    Member1: {
        email: "member1@example.com",
        password: "hashedpw",
        loginPath: "/guest/partner/login",
        //redirectTo: "/member/community/own",
    },
};